import {
  buildRepay,
  calculateHealthFactorFromBalancesBigUnits,
} from "@galacticcouncil/money-market/core"
import { moneyMarketKeys } from "@galacticcouncil/money-market/react"
import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import z from "zod/v4"

import { formatHealthFactorResult } from "@/api/aave"
import { TAssetData } from "@/api/assets"
import { useAccountBalances } from "@/api/balances"
import {
  fetchFeePerGas,
  planToTransaction,
} from "@/modules/money-market/actions/planToTransaction"
import { useUserAddress } from "@/modules/money-market/hooks"
import {
  GIGA_MARKET,
  useGigaBorrowSummary,
} from "@/modules/staking/gigaStaking/useGigaBorrowSummary"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman, toBigInt } from "@/utils/formatting"
import { positive } from "@/utils/validators"

export type GigaHDXRepayFormValues = {
  amount: string
  asset: TAssetData
  isMaxSelected: boolean
}

const MAX_REPPAY_DUST_FACTOR = 1.001

export const useGigaHDXRepay = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation(["common", "borrow", "staking"])
  const { getAssetWithFallback } = useAssets()

  const hollarAsset = getAssetWithFallback(HOLLAR_ASSET_ID)
  const user = useUserAddress()
  const provider = useRpcProvider()
  const { getTransferableBalance } = useAccountBalances()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const { data: gigaBorrowSummary } = useGigaBorrowSummary()
  const {
    account: marketAccount,
    hollarReserve,
    hollarPosition,
  } = gigaBorrowSummary ?? {}

  const debtAmount = Big(hollarPosition?.variableBorrows || "0")
    .mul(MAX_REPPAY_DUST_FACTOR)
    .toString()
  const walletBalance = scaleHuman(
    getTransferableBalance(HOLLAR_ASSET_ID),
    hollarAsset.decimals,
  )

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
          .refine((value) => new Big(value || "0").lte(walletBalance), {
            error: t("error.maxBalance"),
          })
          .refine((value) => new Big(value || "0").lte(debtAmount), {
            error: t("staking:gigaStaking.repay.error.repayLimit"),
          }),
        asset: z.custom<TAssetData>(),
        isMaxSelected: z.boolean(),
      }),
    ),
  })
  const [amount, isMaxSelected] = form.watch(["amount", "isMaxSelected"])

  const maxRepayAmount = Big.min(debtAmount, walletBalance)
  const maxRepayAmountString = maxRepayAmount.toString()
  const repayAmount = Big.min(amount || "0", maxRepayAmountString)
  const remainingDebt = Big.max(Big(debtAmount).minus(repayAmount), 0)
  const remainingDebtUsd = remainingDebt.mul(hollarReserve?.priceInUsd || "0")

  useEffect(() => {
    if (isMaxSelected) {
      form.setValue("amount", maxRepayAmountString)
    }
  }, [isMaxSelected, form, maxRepayAmountString])
  const repayAmountUsd = Big(amount || "0").mul(
    hollarReserve?.priceInUsd || "0",
  )
  const remainingBorrowBalance = Big(
    marketAccount?.totalBorrowsUsd || "0",
  ).minus(repayAmountUsd)
  const futureHealthFactorRaw = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency:
      marketAccount?.totalCollateralUsd || "0",
    borrowBalanceMarketReferenceCurrency: Big.max(
      remainingBorrowBalance,
      0,
    ).toString(),
    currentLiquidationThreshold:
      marketAccount?.currentLiquidationThreshold || "0",
  })

  const healthFactor = formatHealthFactorResult({
    currentHF: marketAccount?.healthFactor || "-1",
    futureHF: futureHealthFactorRaw.toString(),
  })

  const mutation = useMutation({
    mutationFn: async (amount: string) => {
      if (!user || !hollarReserve?.underlyingAsset) return

      const amountWei = toBigInt(amount, hollarAsset.decimals)

      if (amountWei <= 0n) return

      const plan = buildRepay({
        market: GIGA_MARKET,
        asset: hollarReserve.underlyingAsset,
        amount: amountWei,
        onBehalfOf: user,
      })
      const feePerGas = await fetchFeePerGas(provider.evm)

      const toasts = {
        submitted: t("staking:gigaStaking.repay.toasts.submitted", {
          value: amount,
          symbol: hollarAsset.symbol,
        }),
        success: t("staking:gigaStaking.repay.toasts.success", {
          value: amount,
          symbol: hollarAsset.symbol,
        }),
      }

      await createTransaction(
        {
          tx: planToTransaction(plan, {
            papi: provider.papi,
            from: user,
            feePerGas,
          }),
          toasts,
          invalidateQueries: [[...moneyMarketKeys.market(GIGA_MARKET.market)]],
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
    walletBalance,
    remainingDebt,
    remainingDebtUsd,
    hollarAsset,
    hollarReserve,
  }
}
