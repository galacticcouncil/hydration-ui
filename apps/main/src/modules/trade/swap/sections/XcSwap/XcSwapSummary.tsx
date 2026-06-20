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

import { Trade } from "@/api/trade"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"
import { CalculatedAmountSummaryRow } from "@/modules/trade/swap/sections/Market/Summary/CalculatedAmountSummaryRow"
import { MarketSummarySwap } from "@/modules/trade/swap/sections/Market/Summary/MarketSummarySwap"
import { PriceImpactSummaryRow } from "@/modules/trade/swap/sections/Market/Summary/PriceImpactSummaryRow"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useAssets } from "@/providers/assetsProvider"
import { useTradeSettings } from "@/states/tradeSettings"

export const XcSwapSummary = () => {
  const { quote } = useXcSwap()

  if (quote?.kind === "oc") {
    return <OnChainSummary trade={quote.trade} />
  }

  if (quote?.kind === "xc") {
    return <CrossChainSummary trade={quote.trade} />
  }

  return null
}

const OnChainSummary = ({ trade }: { readonly trade: Trade }) => {
  const { getAsset } = useAssets()
  const { watch } = useFormContext<XcSwapFormValues>()

  const [srcAsset, destAsset] = watch(["srcAsset", "destAsset"])
  const sellAsset =
    srcAsset?.id !== undefined ? (getAsset(String(srcAsset.id)) ?? null) : null
  const buyAsset =
    destAsset?.id !== undefined
      ? (getAsset(String(destAsset.id)) ?? null)
      : null

  return (
    <MarketSummarySwap
      swap={trade}
      healthFactor={undefined}
      sellAssetOverride={sellAsset}
      buyAssetOverride={buyAsset}
    />
  )
}

const CrossChainSummary = ({ trade }: { readonly trade: XcSwapTrade }) => {
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

  const destAsset = watch("destAsset")
  const minAmountOut = trade.minAmountOut.toDecimal()
  const [minAmountOutDisplay, { isLoading: isMinAmountOutDisplayLoading }] =
    useDisplayAssetPrice(
      destAsset?.id !== undefined ? String(destAsset.id) : "",
      minAmountOut,
    )

  const feeUsd = t("currency", {
    value: trade.fee.usd,
    maximumFractionDigits: null,
  })
  const feePct = t("percent", { value: trade.fee.pct })

  const eta = t("interval.short", { value: trade.timeEstimate.quote * 1000 })

  const formattedMinAmountOut = t("currency", {
    value: minAmountOut,
    symbol: trade.minAmountOut.symbol,
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
        amountDisplay={destAsset?.id !== undefined ? minAmountOutDisplay : null}
        isLoading={destAsset?.id !== undefined && isMinAmountOutDisplayLoading}
        isExpanded={isSummaryExpanded}
        onIsExpandedChange={changeSummaryExpanded}
      />
      <CollapsibleContent asChild>
        <Summary separator={<SwapSectionSeparator />} withLeadingSeparator>
          <PriceImpactSummaryRow priceImpact={trade.priceImpactPct} />
          <SwapSummaryRow
            label={t("trade:market.summary.estTradeFees")}
            tooltip={t("trade:market.summary.estTradeFees.tooltip")}
            content={
              <Text fs="p5" fw={500} lh={1.2}>
                <span sx={{ color: getToken("text.high") }}>{feeUsd}</span>{" "}
                <span sx={{ color: getToken("colors.skyBlue.500") }}>
                  ({feePct})
                </span>
              </Text>
            }
          />
          <SwapSummaryRow label="Estimated time" content={eta} />
        </Summary>
      </CollapsibleContent>
    </CollapsibleRoot>
  )
}
