import { HDX_ERC20_ASSET_ID } from "@galacticcouncil/money-market/ui-config"
import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import z from "zod/v4"

import { TAssetData } from "@/api/assets"
import {
  nativeTokenLocksQuery,
  TokenLockType,
  useNativeTokenLocks,
} from "@/api/balances"
import { userGigaBorrowSummaryQueryKey } from "@/api/borrow/queries"
import { evmAccountBindingQuery } from "@/api/evm"
import { gigaQueryKey, useGigaStakeExchangeRate } from "@/api/gigaStake"
import { useAccountFeePaymentAssetId } from "@/api/payments"
import { GigaStakeProps } from "@/modules/staking/gigaStaking/stake/GigaStake"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman, toBigInt, toDecimal } from "@/utils/formatting"
import { positive } from "@/utils/validators"

type GigaStakeFormValues = {
  amount: string
  asset: TAssetData
}

export const useGigaStake = ({ minStake, hdxReserve }: GigaStakeProps) => {
  const { native, getAssetWithFallback } = useAssets()

  const { t } = useTranslation(["common", "staking"])
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const address = account?.address ?? ""
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const { data: exchangeRate } = useGigaStakeExchangeRate()
  const { getBalance } = useAccountBalances()
  const nativeBalance = getBalance(native.id)
  const { data: locksData } = useNativeTokenLocks()

  const vested = locksData?.get(TokenLockType.Vesting) ?? 0n
  const staked = locksData?.get(TokenLockType.Staking) ?? 0n
  const gigaStaked = locksData?.get(TokenLockType.GigaStaking) ?? 0n

  const maxStake = Big.max(
    0,
    nativeBalance
      ? Big(nativeBalance.free.toString())
          .minus(vested.toString())
          .minus(staked.toString())
          .minus(gigaStaked.toString())
          .toString()
      : 0,
  )
  const maxStakeHuman = toDecimal(maxStake, native.decimals)
  const minStakeHuman = toDecimal(minStake, native.decimals)

  // In Aave a supplyCap of 0 means "no cap" (unlimited). Treat it as such:
  // otherwise `supplyCap - totalLiquidity` evaluates to 0 and the stake form
  // wrongly reports "Maximum value to stake is 0".
  const isReserveCapUnlimited = Big(hdxReserve.supplyCap).lte(0)
  const availableHDXReserveCap = isReserveCapUnlimited
    ? ""
    : Big(hdxReserve.supplyCap)
        .minus(hdxReserve.totalLiquidity)
        .times(exchangeRate?.toString() || 1)
        .toString()

  const {
    data: accountFeePaymentAssetId,
    isSuccess: isAccountFeePaymentAssetIdSuccess,
  } = useAccountFeePaymentAssetId()

  const { data: isBound } = useQuery(evmAccountBindingQuery(rpc, address))

  const { data: feeCost } = useQuery({
    enabled: !!address && isAccountFeePaymentAssetIdSuccess,
    queryKey: ["feeCost", "gigaStake", address],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const stakeTx = unsafeApi.tx.GigaHdx.giga_stake({
        amount: toBigInt(1, native.decimals),
      })

      const tx = !isBound
        ? rpc.papi.tx.Utility.batch_all({
            calls: [
              rpc.papi.tx.EVMAccounts.bind_evm_address().decodedCall,
              stakeTx.decodedCall,
            ],
          })
        : stakeTx

      if (accountFeePaymentAssetId === Number(native.id)) {
        const fees = (await tx.getEstimatedFees(address)) || 0
        const feeEstimateNativeBase = scaleHuman(
          Big(fees).plus(native.existentialDeposit).toString(),
          native.decimals,
        )

        return feeEstimateNativeBase
      }

      return "0"
    },
  })

  const maxBalanceWithFee = Big.max(
    0,
    Big(maxStakeHuman)
      .minus(feeCost || 0)
      .toString(),
  ).toString()

  const form = useForm<GigaStakeFormValues>({
    mode: "onChange",
    defaultValues: {
      amount: "",
      asset: native,
    },

    resolver: standardSchemaResolver(
      z
        .object({ amount: positive, asset: z.custom<TAssetData>() })
        .check(
          z.refine<GigaStakeFormValues>(
            ({ amount }) => amount === "" || Big(amount).gte(minStakeHuman),
            {
              error: t("staking:stake.stake.minStakeError", {
                amount: t("currency", {
                  value: scaleHuman(minStake, native.decimals),
                  symbol: native.symbol,
                }),
              }),
              path: ["amount"],
            },
          ),
        )
        .check(
          z.refine<GigaStakeFormValues>(
            ({ amount }) =>
              amount === "" ||
              isReserveCapUnlimited ||
              Big(amount).lte(availableHDXReserveCap),
            {
              error: t("staking:stake.stake.reserveCapError", {
                amount: t("currency", {
                  value: availableHDXReserveCap,
                  symbol: native.symbol,
                }),
              }),
              path: ["amount"],
            },
          ),
        )
        .check(
          z.refine<GigaStakeFormValues>(
            ({ amount }) => Big(amount || "0").lte(maxBalanceWithFee),
            {
              error: t("error.maxBalance"),
              path: ["amount"],
            },
          ),
        ),
    ),
  })

  const amount = form.watch("amount") || "0"
  const amountInGigaHdx = exchangeRate
    ? Big(amount).div(exchangeRate.toString()).toString()
    : undefined

  const mutation = useMutation({
    mutationFn: async (amount: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const stakeTx = unsafeApi.tx.GigaHdx.giga_stake({
        amount: toBigInt(amount, native.decimals),
      })

      const tx = !isBound
        ? rpc.papi.tx.Utility.batch_all({
            calls: [
              rpc.papi.tx.EVMAccounts.bind_evm_address().decodedCall,
              stakeTx.decodedCall,
            ],
          })
        : stakeTx

      const toasts = {
        submitted: t("staking:gigaStaking.stake.toasts.submitted", {
          value: amount,
          symbol: native.symbol,
        }),
        success: t("staking:gigaStaking.stake.toasts.success", {
          value: amount,
          symbol: native.symbol,
        }),
      }

      return createTransaction(
        {
          tx,
          invalidateQueries: [
            userGigaBorrowSummaryQueryKey(address),
            gigaQueryKey(address),
            nativeTokenLocksQuery(rpc, address).queryKey,
            ...(!isBound
              ? [evmAccountBindingQuery(rpc, address).queryKey]
              : []),
          ],
          toasts,
        },
        { onSuccess: () => form.reset() },
      )
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values.amount)
  })

  return {
    form,
    meta: native,
    minStakeHuman,
    amountInGigaHdx,
    maxStakeHuman: maxBalanceWithFee,
    gigaHdxMeta: getAssetWithFallback(HDX_ERC20_ASSET_ID),
    onSubmit,
  }
}
