import {
  buildBorrow,
  calculateHealthFactorFromBalancesBigUnits,
} from "@galacticcouncil/money-market/core"
import { moneyMarketKeys } from "@galacticcouncil/money-market/react"
import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import z from "zod/v4"

import { formatHealthFactorResult } from "@/api/aave"
import { TAssetData } from "@/api/assets"
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
import { toBigInt, toDecimal } from "@/utils/formatting"
import { positive } from "@/utils/validators"

type GigaHDXBorrowFormValues = {
  amount: string
  asset: TAssetData
}

export const useGigaHDXBorrow = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation(["common", "staking"])
  const { data: gigaBorrowSummary } = useGigaBorrowSummary()
  const { getAssetWithFallback } = useAssets()
  const user = useUserAddress()
  const provider = useRpcProvider()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  const {
    maxBorrowableHollar,
    account: marketAccount,
    hollarReserve,
  } = gigaBorrowSummary ?? {}
  const hollarAsset = getAssetWithFallback(HOLLAR_ASSET_ID)

  const maxBorrowableWei = toBigInt(
    maxBorrowableHollar || "0",
    hollarAsset.decimals,
  )

  const maxBorrowableAmount = toDecimal(maxBorrowableWei, hollarAsset.decimals)

  const form = useForm<GigaHDXBorrowFormValues>({
    mode: "onChange",
    defaultValues: {
      amount: "",
      asset: hollarAsset,
    },
    resolver: standardSchemaResolver(
      z.object({
        amount: positive.refine(
          (value) => new Big(value || "0").lte(maxBorrowableAmount || "0"),
          {
            error: t("staking:gigaStaking.borrow.error.borrowLimit"),
          },
        ),
        asset: z.custom<TAssetData>(),
      }),
    ),
  })

  const amount = form.watch("amount")

  const borrowAmountUsd = Big(amount || "0").mul(
    hollarReserve?.priceInUsd || "0",
  )
  const futureBorrowBalance = Big(marketAccount?.totalBorrowsUsd || "0").plus(
    borrowAmountUsd,
  )
  const futureHealthFactorRaw = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency:
      marketAccount?.totalCollateralUsd || "0",
    borrowBalanceMarketReferenceCurrency: futureBorrowBalance.toString(),
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

      const plan = buildBorrow({
        market: GIGA_MARKET,
        asset: hollarReserve.underlyingAsset,
        amount: toBigInt(amount, hollarAsset.decimals),
        onBehalfOf: user,
      })
      const feePerGas = await fetchFeePerGas(provider.evm)

      await createTransaction(
        {
          tx: planToTransaction(plan, {
            papi: provider.papi,
            from: user,
            feePerGas,
          }),
          invalidateQueries: [[...moneyMarketKeys.market(GIGA_MARKET.market)]],
          toasts: {
            submitted: t("staking:gigaStaking.borrow.toasts.submitted", {
              value: amount,
              symbol: hollarAsset.symbol,
            }),
            success: t("staking:gigaStaking.borrow.toasts.success", {
              value: amount,
              symbol: hollarAsset.symbol,
            }),
          },
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
    maxBorrowableWei,
    borrowableAmount: maxBorrowableAmount,
    variableBorrowApy: hollarReserve?.variableBorrowApy ?? "0",
  }
}
