import {
  buildSetUsageAsCollateral,
  buildSupply,
  hasBlocker,
} from "@galacticcouncil/money-market/core"
import {
  moneyMarketKeys,
  useAccountSummary,
  useMoneyMarket,
  useSupplyAssessment,
} from "@galacticcouncil/money-market/react"
import type { ActionPlan } from "@galacticcouncil/money-market/types"
import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { first, isNullish } from "remeda"
import { Address, parseUnits } from "viem"
import z from "zod"

import { TAssetData, TErc20AToken } from "@/api/assets"
import { useAccountBalances } from "@/api/balances"
import { useBorrowAssetsApy } from "@/api/borrow"
import { useAccountFeePaymentAssetId } from "@/api/payments"
import { spotPriceQuery } from "@/api/spotPrice"
import { bestSellWithTxQuery } from "@/api/trade"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useMinimumTradeAmount } from "@/modules/liquidity/components/RemoveLiquidity/RemoveMoneyMarketLiquidity.utils"
import {
  fetchFeePerGas,
  planToTransaction,
} from "@/modules/money-market/actions/planToTransaction"
import { useUserAddress } from "@/modules/money-market/hooks"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import {
  useFormMaxBalanceWithFee,
  ValidateFormMaxBalanceWithFee,
} from "@/modules/transactions/hooks/useFormMaxBalanceWithFee"
import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"
import { isEvmCall } from "@/modules/transactions/utils/xcm"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { scaleHuman } from "@/utils/formatting"

export type TSupplyIsolatedLiquidityFormValues = {
  amount: string
  asset: TAssetData
}

const isAsset = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

export const useSupplyIsolatedLiquidity = ({
  initialAsset,
  aToken,
  supplyAssetId,
  asset,
  decimals,
  onSubmitted,
}: {
  initialAsset: TAssetData
  aToken: TErc20AToken
  supplyAssetId: string
  /** The reserve's underlying asset. */
  asset: Address
  decimals: number
  onSubmitted: () => void
}) => {
  const { t } = useTranslation("borrow")
  const rpc = useRpcProvider()
  const { sdk, isReady, papi, evm } = rpc
  const { account } = useAccount()
  const { market } = useMoneyMarket()
  const user = useUserAddress()
  const { getAssetWithFallback } = useAssets()
  const { getTransferableBalance } = useAccountBalances()
  const { data: accountFeePaymentAssetId } = useAccountFeePaymentAssetId()
  const createBatch = useCreateBatchTx()
  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()
  const queryClient = useQueryClient()

  const { data: feeEstimationSwapTx } = useQuery({
    enabled:
      isReady && !!account?.address && !isNullish(accountFeePaymentAssetId),
    queryKey: [
      "supplyIsolatedLiquidityFeeEstimation",
      accountFeePaymentAssetId,
      aToken.id,
    ],
    queryFn: async () => {
      const swap = await sdk.api.router.getBestSell(
        accountFeePaymentAssetId ?? 0,
        Number(aToken.id),
        scaleHuman(
          getTransferableBalance(accountFeePaymentAssetId?.toString() ?? ""),
          getAssetWithFallback(accountFeePaymentAssetId?.toString() ?? "")
            .decimals,
        ),
      )

      return sdk.tx
        .trade(swap)
        .withSlippage(swapSlippage)
        .withBeneficiary(account?.address ?? "")
        .build()
        .then((tx) => tx.get())
    },
  })

  const { getMaxBalance, validateBalance } = useFormMaxBalanceWithFee(
    feeEstimationSwapTx ?? null,
  )

  const form = useSupplyIsolatedLiquidityForm({
    asset: initialAsset,
    validateBalance,
  })
  const getMinimumTradeAmount = useMinimumTradeAmount()
  const { data: assetsApy } = useBorrowAssetsApy([supplyAssetId])

  const apys =
    first(assetsApy)?.underlyingAssetsApyData.map((apyData) => ({
      apy: apyData.supplyApy,
      apyType: apyData.apyType,
    })) ?? []

  const [amountIn, assetIn] = form.watch(["amount", "asset"])

  const maxBalance = getMaxBalance(assetIn)
  const isAaveSupply = aToken.underlyingAssetId === assetIn.id

  const { data: spotPriceData, isLoading: isPriceLoading } = useQuery({
    ...spotPriceQuery(rpc, assetIn.id, aToken.id),
    enabled: !isAaveSupply,
  })

  const [debouncedAmountIn, isAmountInSynced] = useDebouncedValue(amountIn)

  const { data: quotedTrade, isLoading: isTradeQueryLoading } = useQuery(
    bestSellWithTxQuery(rpc, {
      assetIn: assetIn.id,
      assetOut: aToken.id,
      amountIn: isAaveSupply ? "0" : debouncedAmountIn,
      slippage: swapSlippage,
      address: account?.address ?? "",
    }),
  )

  const trade = isAmountInSynced && !isAaveSupply ? quotedTrade : undefined
  const isTradeLoading =
    !isAmountInSynced || (!isAaveSupply && isTradeQueryLoading)

  const minReceiveAmountShifted = isAaveSupply
    ? debouncedAmountIn || "0"
    : scaleHuman(
        getMinimumTradeAmount(trade?.swap)?.toString() ?? "0",
        aToken.decimals,
      )

  const assessment = useSupplyAssessment({
    user,
    asset,
    amount: minReceiveAmountShifted,
  })
  const findings = assessment.data?.findings ?? []
  const isBlockedSupply = hasBlocker(findings)
  const current = useAccountSummary(user)

  const isAssessing = !!user && (assessment.isPending || current.isPending)

  const projectedPosition = assessment.data?.projection.positions.find((p) =>
    isAsset(p.underlyingAsset, asset),
  )
  const currentPosition = current.data?.positions.find((p) =>
    isAsset(p.underlyingAsset, asset),
  )
  const enablesCollateral =
    !!projectedPosition?.usageAsCollateralEnabledOnUser &&
    !currentPosition?.usageAsCollateralEnabledOnUser

  const onSubmit = async () => {
    if (!user) throw new Error("EVM address not found")

    const isolationJoin = assessment.data?.isolationJoin
    const feePerGas = await fetchFeePerGas(evm)
    const toPapiTx = (plan: ActionPlan) => {
      const tx = planToTransaction(plan, { papi, from: user, feePerGas })

      if (isEvmCall(tx)) {
        return papi.tx.Dispatcher.dispatch_evm_call({
          call: transformEvmCallToPapiTx(papi, tx).decodedCall,
        })
      }
      if (isPapiTransaction(tx)) return tx

      throw new Error("Invalid supply transaction")
    }

    const txs = []

    if (isAaveSupply) {
      txs.push(
        toPapiTx(
          buildSupply({
            market,
            asset,
            amount: parseUnits(amountIn, decimals),
            onBehalfOf: user,
            isolationJoin,
          }),
        ),
      )
    } else {
      if (!trade?.tx) throw new Error("Trade not found")
      txs.push(trade.tx)

      // The router supplies on the user's behalf, so turning the asset into
      // collateral (and the other collateral off) follows as plain pool calls.
      if (enablesCollateral) {
        txs.push(
          toPapiTx([
            ...(isolationJoin?.disableCollateral ?? []).flatMap((collateral) =>
              buildSetUsageAsCollateral({
                market,
                asset: collateral,
                useAsCollateral: false,
              }),
            ),
            ...buildSetUsageAsCollateral({
              market,
              asset,
              useAsCollateral: true,
            }),
          ]),
        )
      }
    }

    const toastParams = {
      amount: minReceiveAmountShifted,
      symbol: aToken.symbol,
    }

    await createBatch({
      txs,
      transaction: {
        toasts: {
          submitted: t("supply.toast.submitted", toastParams),
          success: t("supply.toast.success", toastParams),
        },
      },
      options: {
        onSubmitted,
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: moneyMarketKeys.market(market.market),
          })
        },
      },
    })
  }

  return {
    form,
    maxBalance,
    onSubmit,
    findings,
    isAssessing,
    currentHealthFactor: current.data?.account.healthFactor,
    projectedHealthFactor: assessment.data?.projection.account.healthFactor,
    isCollateral: !!projectedPosition?.usageAsCollateralEnabledOnUser,
    isBlockedSupply,
    minReceiveAmountShifted,
    apys,
    spotPriceData,
    isPriceLoading,
    isAaveSupply,
    isTradeLoading,
    swap: trade?.swap,
  }
}

const useSupplyIsolatedLiquidityForm = ({
  asset,
  validateBalance,
}: {
  asset: TAssetData
  validateBalance: ValidateFormMaxBalanceWithFee
}) => {
  return useForm<TSupplyIsolatedLiquidityFormValues>({
    mode: "onChange",
    defaultValues: {
      amount: "",
      asset,
    },
    resolver: standardSchemaResolver(
      z
        .object({
          amount: z.string(),
          asset: z.custom<TAssetData>(),
        })
        .check(validateBalance("amount", (form) => [form.asset, form.amount])),
    ),
  })
}
