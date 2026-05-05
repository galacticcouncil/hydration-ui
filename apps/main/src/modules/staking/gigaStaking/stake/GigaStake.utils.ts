import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import z from "zod/v4"

import { TAssetData } from "@/api/assets"
import { TokenLockType, useNativeTokenLocks } from "@/api/balances"
import { userGigaBorrowSummaryQueryKey } from "@/api/borrow/queries"
import { evmAccountBindingQuery } from "@/api/evm"
import { GigaStakeProps } from "@/modules/staking/gigaStaking/stake/GigaStake"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman, toBigInt, toDecimal } from "@/utils/formatting"
import { positive, useValidateFormMaxBalance } from "@/utils/validators"

type GigaStakeFormValues = {
  amount: string
  asset: TAssetData
}

export const useGigaStake = ({ minStake, hdxReserve }: GigaStakeProps) => {
  const { native } = useAssets()
  const { t } = useTranslation(["common", "staking"])
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const address = account?.address ?? ""
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const refineMaxBalance = useValidateFormMaxBalance()
  const { getBalance } = useAccountBalances()
  const nativeBalance = getBalance(native.id)
  const { data: locksData } = useNativeTokenLocks()

  const vested = locksData?.get(TokenLockType.Vesting) ?? 0n
  const staked = locksData?.get(TokenLockType.Staking) ?? 0n
  const gigaStaked = locksData?.get(TokenLockType.GigaStaking) ?? 0n

  const maxStake = Big.max(
    0,
    Big(nativeBalance?.free.toString() || "0")
      .minus(vested.toString())
      .minus(staked.toString())
      .minus(gigaStaked.toString())
      .toString(),
  )
  const maxStakeHuman = toDecimal(maxStake, native.decimals)
  const minStakeHuman = toDecimal(minStake, native.decimals)
  //@TODO: convert to HDX value when spot price is available
  const availableReserveCap = Big(hdxReserve.supplyCap)
    .minus(hdxReserve.totalLiquidity)
    .toString()

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
              amount === "" || Big(amount).lte(availableReserveCap),
            {
              error: t("staking:stake.stake.reserveCapError", {
                amount: t("currency", {
                  value: availableReserveCap,
                  symbol: native.symbol,
                }),
              }),
              path: ["amount"],
            },
          ),
        )
        .check(refineMaxBalance("amount", (form) => [form.asset, form.amount])),
    ),
  })

  const mutation = useMutation({
    mutationFn: async (amount: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const stakeTx = unsafeApi.tx.GigaHdx.giga_stake({
        hdx_amount: toBigInt(amount, native.decimals),
      })

      const isBound = await rpc.queryClient.ensureQueryData(
        evmAccountBindingQuery(rpc, address),
      )

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

      if (!isBound) {
        return createTransaction(
          {
            tx: rpc.papi.tx.Utility.batch_all({
              calls: [
                rpc.papi.tx.EVMAccounts.bind_evm_address().decodedCall,
                stakeTx.decodedCall,
              ],
            }),
            invalidateQueries: [userGigaBorrowSummaryQueryKey(address)],
            toasts,
          },
          { onSuccess: () => form.reset() },
        )
      }

      return createTransaction(
        {
          tx: stakeTx,
          invalidateQueries: [userGigaBorrowSummaryQueryKey(address)],
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
    maxStakeHuman,
    onSubmit,
  }
}
