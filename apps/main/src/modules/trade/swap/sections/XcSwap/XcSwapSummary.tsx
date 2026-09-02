import {
  CollapsibleContent,
  CollapsibleRoot,
  Summary,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { XcSwapTrade } from "@galacticcouncil/xc-swap"
import { produce } from "immer"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { Trade, TradeOrder } from "@/api/trade"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"
import { CalculatedAmountSummaryRow } from "@/modules/trade/swap/sections/Market/Summary/CalculatedAmountSummaryRow"
import { MarketSummarySwap } from "@/modules/trade/swap/sections/Market/Summary/MarketSummarySwap"
import { MarketSummaryTwap } from "@/modules/trade/swap/sections/Market/Summary/MarketSummaryTwap"
import { PriceImpactSummaryRow } from "@/modules/trade/swap/sections/Market/Summary/PriceImpactSummaryRow"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useTradeSettings } from "@/states/tradeSettings"
import { maxBalanceError } from "@/utils/validators"

export const XcSwapSummary = () => {
  const { quote } = useXcSwap()

  if (quote?.kind === "oc") {
    return (
      <>
        <SwapSectionSeparator />
        <OnChainSummary swap={quote.swap} twap={quote.twap} />
      </>
    )
  }

  if (quote?.kind === "xc") {
    return (
      <>
        <SwapSectionSeparator />
        <CrossChainSummary swap={quote.swap} />
      </>
    )
  }

  return null
}

const OnChainSummary = ({
  swap,
  twap,
}: {
  readonly swap: Trade
  readonly twap: TradeOrder | undefined
}) => {
  const { healthFactor } = useXcSwap()
  const { watch, formState } = useFormContext<XcSwapFormValues>()

  const isSingleTrade = watch("isSingleTrade")

  if (!isSingleTrade && twap) {
    return (
      <MarketSummaryTwap swap={swap} twap={twap} healthFactor={healthFactor} />
    )
  }

  const isHealthFactorShown =
    formState.errors.sellAmount?.message !== maxBalanceError

  return (
    <MarketSummarySwap
      swap={swap}
      healthFactor={isHealthFactorShown ? healthFactor : undefined}
    />
  )
}

const CrossChainSummary = ({ swap }: { readonly swap: XcSwapTrade }) => {
  const { t } = useTranslation(["common", "trade"])
  const { update: updateTradeSettings, ...tradeSettings } = useTradeSettings()
  const { watch } = useFormContext<XcSwapFormValues>()

  const {
    general: { isSummaryExpanded },
  } = tradeSettings

  const changeSummaryExpanded = (isSummaryExpanded: boolean) =>
    updateTradeSettings(
      produce(tradeSettings, (draft) => {
        draft.general.isSummaryExpanded = isSummaryExpanded
      }),
    )

  const buyAsset = watch("buyAsset")
  const minAmountOut = swap.minAmountOut.toDecimal()
  const buyAssetId = buyAsset?.id !== undefined ? String(buyAsset.id) : ""
  const [minAmountOutDisplay, { isLoading: isMinAmountOutDisplayLoading }] =
    useDisplayAssetPrice(buyAssetId, minAmountOut)

  const feeUsd = t("currency", {
    value: swap.fee.usd,
    maximumFractionDigits: null,
  })
  const feePct = t("percent", { value: swap.fee.pct })

  const eta = t("interval.short", { value: swap.timeEstimate.quote * 1000 })

  const formattedMinAmountOut = t("currency", {
    value: minAmountOut,
    symbol: swap.minAmountOut.symbol,
  })

  return (
    <CollapsibleRoot
      open={isSummaryExpanded}
      onOpenChange={changeSummaryExpanded}
    >
      <CalculatedAmountSummaryRow
        label={t("trade:market.summary.minReceived")}
        tooltip={t("trade:market.summary.minReceived.tooltip")}
        amount={formattedMinAmountOut}
        amountDisplay={buyAssetId ? minAmountOutDisplay : null}
        isLoading={!!buyAssetId && isMinAmountOutDisplayLoading}
        isExpanded={isSummaryExpanded}
        onIsExpandedChange={changeSummaryExpanded}
      />
      <CollapsibleContent
        asChild
        sx={{ overflow: "hidden", mx: "-xl", px: "xl" }}
      >
        <Summary separator={<SwapSectionSeparator />} withLeadingSeparator>
          <PriceImpactSummaryRow priceImpact={swap.priceImpactPct} />
          <SwapSummaryRow
            label={t("trade:market.summary.estTradeFees")}
            tooltip={t("trade:market.summary.estTradeFees.tooltip")}
            content={
              <Text fs="p5" fw={500} lh={1.2}>
                <span sx={{ color: getToken("text.high") }}>{feeUsd}</span>{" "}
                <span sx={{ color: getToken("text.tint.quart") }}>
                  ({feePct})
                </span>
              </Text>
            }
          />
          <SwapSummaryRow
            label={t("trade:xc.swap.summary.estimatedTime")}
            content={eta}
          />
        </Summary>
      </CollapsibleContent>
    </CollapsibleRoot>
  )
}
