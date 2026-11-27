import { Trade, TradeOrder } from "@galacticcouncil/sdk-next/sor"
import {
  Box,
  CollapsibleContent,
  CollapsibleRoot,
  Flex,
  Summary,
  SummaryRowDisplayValue,
  SummaryRowValue,
} from "@galacticcouncil/ui/components"
import Big from "big.js"
import { produce } from "immer"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { HealthFactorResult } from "@/api/aave"
import { TAssetData } from "@/api/assets"
import { calculateSlippage } from "@/api/utils/slippage"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { DynamicFee } from "@/components/DynamicFee"
import { HealthFactorChange } from "@/modules/money-market/actions/HealthFactorChange"
import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"
import { TradeRoutes } from "@/modules/trade/swap/components/TradeRoutes/TradeRoutes"
import { CalculatedAmountSummaryRow } from "@/modules/trade/swap/sections/XcSwap/components/Summary/CalculatedAmountSummaryRow"
import { PriceImpactSummaryRow } from "@/modules/trade/swap/sections/XcSwap/components/Summary/PriceImpactSummaryRow"
import { TradeLimitSummaryRow } from "@/modules/trade/swap/sections/XcSwap/components/Summary/TradeLimitSummaryRow"
import { useTwapFee } from "@/modules/trade/swap/sections/XcSwap/hooks/useTwapFee"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useAssets } from "@/providers/assetsProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { scaleHuman } from "@/utils/formatting"
import { getTradeFeeIntervals } from "@/utils/trade"

type Props = {
  readonly swap: Trade
  readonly twap: TradeOrder
  readonly healthFactor: HealthFactorResult | undefined
  readonly sellAsset: TAssetData | null
  readonly buyAsset: TAssetData | null
}

export const TwapSummary: FC<Props> = ({
  swap,
  twap,
  healthFactor,
  sellAsset,
  buyAsset,
}) => {
  const { t } = useTranslation(["common", "trade"])
  const { getAssetWithFallback } = useAssets()

  const { update: updateTradeSettings, ...tradeSettings } = useTradeSettings()

  const {
    general: { isSummaryExpanded },
    dca: { slippage: twapSlippage },
  } = tradeSettings

  const changeSummaryExpanded = (isSummaryExpanded: boolean) =>
    updateTradeSettings(
      produce(tradeSettings, (draft) => {
        draft.general.isSummaryExpanded = isSummaryExpanded
      }),
    )

  const { data: transactionFee, isLoading: isTransactionFeeLoading } =
    useTwapFee(twap, isSummaryExpanded)
  const transactionCosts = transactionFee?.feeEstimate || "0"

  const tradeFeeAsset = buyAsset
  const tradeFee = tradeFeeAsset
    ? scaleHuman(twap.tradeFee, tradeFeeAsset.decimals)
    : "0"

  const [tradeFeeDisplay] = useDisplayAssetPrice(
    tradeFeeAsset?.id ?? "",
    tradeFee,
    { maximumFractionDigits: null },
  )

  const transactionFeeAsset = getAssetWithFallback(
    transactionFee?.feeAssetId ?? "",
  )

  const [transactionCostsDisplay] = useDisplayAssetPrice(
    transactionFee?.feeAssetId ?? "",
    transactionCosts,
    { maximumFractionDigits: null },
  )

  // Like a single trade: the expected output less the slippage the intent is
  // placed with
  const [twapPriceHuman, twapPriceAsset] =
    sellAsset && buyAsset
      ? [
          scaleHuman(
            twap.amountOut - calculateSlippage(twap.amountOut, twapSlippage),
            buyAsset.decimals,
          ),
          buyAsset,
        ]
      : ["0", null]

  const [twapPriceDisplay, { isLoading: twapPriceDisplayLoading }] =
    useDisplayAssetPrice(twapPriceAsset?.id ?? "", twapPriceHuman)

  if (!sellAsset || !buyAsset || !tradeFeeAsset || !twapPriceAsset) {
    return null
  }

  const tradeAmount = twap.amountOut

  // A dust order can quote no output at all
  const tradeFeePct =
    tradeAmount > 0n
      ? Big(twap.tradeFee.toString())
          .div(tradeAmount.toString())
          .mul(100)
          .toNumber()
      : 0

  const [
    ,
    mediumLow = Number.MAX_SAFE_INTEGER,
    mediumHigh = Number.MAX_SAFE_INTEGER,
  ] = getTradeFeeIntervals(0, 0)

  return (
    <Box>
      {healthFactor?.isSignificantChange && (
        <>
          <SwapSummaryRow
            label={t("healthFactor")}
            content={
              <HealthFactorChange
                current={healthFactor.current}
                projected={healthFactor.future}
              />
            }
          />
          <SwapSectionSeparator />
        </>
      )}
      <CollapsibleRoot
        open={isSummaryExpanded}
        onOpenChange={changeSummaryExpanded}
      >
        <Summary separator={<SwapSectionSeparator />}>
          <TradeLimitSummaryRow
            tradeLimit={twapSlippage}
            priceImpact={swap.priceImpactPct}
            settingsSection="split"
          />
          <CalculatedAmountSummaryRow
            label={t("trade:market.summary.minReceived")}
            tooltip={t("trade:market.summary.minReceived.tooltip")}
            amount={t("currency", {
              value: twapPriceHuman,
              symbol: twapPriceAsset.symbol,
            })}
            amountDisplay={
              twapPriceDisplay
                ? t("parenthesized", {
                    value: twapPriceDisplay,
                  })
                : undefined
            }
            isLoading={twapPriceDisplayLoading}
            isExpanded={isSummaryExpanded}
            onIsExpandedChange={changeSummaryExpanded}
          />
        </Summary>
        <CollapsibleContent asChild>
          <Summary separator={<SwapSectionSeparator />} withLeadingSeparator>
            <PriceImpactSummaryRow
              label={t("trade:market.summary.priceImpact.single")}
              priceImpact={twap.tradeImpactPct}
            />
            <PriceImpactSummaryRow
              label={t("trade:market.summary.priceImpact.split")}
              priceImpact={swap.priceImpactPct}
            />
            <SwapSummaryRow
              label={t("trade:market.summary.estTradeFees")}
              content={
                <DynamicFee
                  amount={tradeFeeDisplay}
                  value={tradeFeePct}
                  rangeLow={mediumLow}
                  rangeHigh={mediumHigh}
                />
              }
              tooltip={t("trade:market.summary.estTradeFees.tooltip")}
            />
            <SwapSummaryRow
              label={t("trade:market.summary.transactionCosts")}
              loading={isTransactionFeeLoading}
              content={
                <Flex gap="s" align="center" justify="flex-end">
                  <SummaryRowValue>
                    {t("currency", {
                      value: transactionCosts,
                      symbol: transactionFeeAsset.symbol,
                    })}
                  </SummaryRowValue>
                  <SummaryRowDisplayValue>
                    {t("parenthesized", {
                      value: transactionCostsDisplay,
                    })}
                  </SummaryRowDisplayValue>
                </Flex>
              }
            />
            <SwapSummaryRow
              label={t("trade:market.summary.routes.label")}
              content={
                <TradeRoutes
                  swapType={swap.type}
                  totalFeesDisplay={tradeFeeDisplay}
                  routes={swap.swaps}
                />
              }
            />
          </Summary>
        </CollapsibleContent>
      </CollapsibleRoot>
    </Box>
  )
}
