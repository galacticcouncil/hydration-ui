import { ProtocolAction } from "@aave/contract-helpers"
import { calculateHealthFactorFromBalancesBigUnits } from "@aave/math-utils"
import { formatHealthFactorResult } from "@galacticcouncil/money-market/utils"
import { HOLLAR_ASSET_ID, safeConvertAnyToH160 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import z from "zod/v4"

import { TAssetData } from "@/api/assets"
import {
  useGigaBorrowPoolContract,
  useUserGigaBorrowSummary,
} from "@/api/borrow"
import {
  convertEvmTxRawToPapiTx,
  userGigaBorrowSummaryQueryKey,
} from "@/api/borrow/queries"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman, toBigInt } from "@/utils/formatting"
import { positive } from "@/utils/validators"

export type GigaHDXRepayFormValues = {
  amount: string
  asset: TAssetData
  isMaxSelected: boolean
}

export const useGigaHDXRepay = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation(["common", "borrow", "staking"])
  const { getAssetWithFallback } = useAssets()

  const hollarAsset = getAssetWithFallback(HOLLAR_ASSET_ID)
  const { account } = useAccount()
  const provider = useRpcProvider()
  const { getTransferableBalance } = useAccountBalances()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const { data: gigaBorrowPoolContract } = useGigaBorrowPoolContract()
  const { data: gigaBorrowSummary } = useUserGigaBorrowSummary()
  const { userSummary, hollarReserve } = gigaBorrowSummary ?? {}

  const debtAmount = hollarReserve?.variableBorrows || "0"
  const walletBalance = scaleHuman(
    getTransferableBalance(HOLLAR_ASSET_ID),
    hollarAsset.decimals,
  )
  const maxRepayAmount = Big.min(debtAmount || "0", walletBalance || "0")
  const maxRepayAmountString = maxRepayAmount.toString()
  const maxRepayWei = toBigInt(maxRepayAmountString, hollarAsset.decimals)

  const form = useForm<GigaHDXRepayFormValues>({
    mode: "onChange",
    defaultValues: {
      amount: "",
      asset: hollarAsset,
      isMaxSelected: false,
    },
    resolver: standardSchemaResolver(
      z.object({
        amount: positive
          .refine((value) => new Big(value || "0").lte(walletBalance || "0"), {
            error: t("error.maxBalance"),
          })
          .refine((value) => new Big(value || "0").lte(debtAmount || "0"), {
            error: t("staking:gigaStaking.repay.error.repayLimit"),
          }),
        asset: z.custom<TAssetData>(),
        isMaxSelected: z.boolean(),
      }),
    ),
  })
  const [amount, isMaxSelected] = form.watch(["amount", "isMaxSelected"])
  const repayAmount = Big.min(amount || "0", maxRepayAmountString)
  const remainingDebt = Big.max(Big(debtAmount || "0").minus(repayAmount), 0)
  const remainingDebtUsd = remainingDebt.mul(
    hollarReserve?.reserve.priceInUSD || "0",
  )

  useEffect(() => {
    if (isMaxSelected) {
      form.setValue("amount", maxRepayAmountString)
    }
  }, [isMaxSelected, form, maxRepayAmountString])
  const repayAmountUsd = Big(amount || "0").mul(
    hollarReserve?.reserve.priceInUSD || "0",
  )
  const remainingBorrowBalance = Big(userSummary?.totalBorrowsUSD || "0").minus(
    repayAmountUsd,
  )
  const futureHealthFactorRaw = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency:
      userSummary?.totalCollateralUSD || "0",
    borrowBalanceMarketReferenceCurrency: Big.max(
      remainingBorrowBalance,
      0,
    ).toString(),
    currentLiquidationThreshold:
      userSummary?.currentLiquidationThreshold || "0",
  })
  const healthFactor = formatHealthFactorResult({
    currentHF: userSummary?.healthFactor || "-1",
    futureHF: futureHealthFactorRaw.toString(),
  })

  const mutation = useMutation({
    mutationFn: async (amount: string) => {
      if (!gigaBorrowPoolContract)
        throw new Error("Giga borrow pool contract not found")
      if (!account?.address || !hollarReserve?.underlyingAsset) return

      const amountWei = toBigInt(
        Big(amount).mul(1.0025).toString(),
        hollarAsset.decimals,
      )

      if (amountWei <= 0n) return

      const evmAddress = safeConvertAnyToH160(account.address)
      const poolInstance = gigaBorrowPoolContract.getContractInstance(
        gigaBorrowPoolContract.poolAddress,
      )

      const txRaw = await poolInstance.populateTransaction.repay(
        hollarReserve.underlyingAsset,
        amountWei,
        2,
        evmAddress,
      )

      const evmCall = await convertEvmTxRawToPapiTx(
        provider,
        txRaw,
        evmAddress,
        ProtocolAction.repay,
      )

      await createTransaction(
        {
          tx: provider.papi.tx.Dispatcher.dispatch_evm_call({
            call: evmCall.decodedCall,
          }),
          invalidateQueries: [userGigaBorrowSummaryQueryKey(account.address)],
        },
        { onSubmitted: onClose },
      )
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values.amount)
  })

  return {
    form,
    healthFactor,
    onSubmit,
    mutation,
    maxRepayAmountString,
    maxRepayWei,
    walletBalance,
    remainingDebt,
    remainingDebtUsd,
    hollarAsset,
    hollarReserve,
  }
}
