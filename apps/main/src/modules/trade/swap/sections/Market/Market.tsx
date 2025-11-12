import { Box } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useSearch } from "@tanstack/react-router"
import Big from "big.js"
import { FC, useState } from "react"
import { FormProvider } from "react-hook-form"

import { TradeType } from "@/api/trade"
import { useMarketForm } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useSubmitSwap } from "@/modules/trade/swap/sections/Market/lib/useSubmitSwap"
import { useSubmitTwap } from "@/modules/trade/swap/sections/Market/lib/useSubmitTwap"
import { useMarketBuyData } from "@/modules/trade/swap/sections/Market/Market.BuyData"
import { useMarketSellData } from "@/modules/trade/swap/sections/Market/Market.SellData"
import { MarketErrors } from "@/modules/trade/swap/sections/Market/MarketErrors"
import { MarketFields } from "@/modules/trade/swap/sections/Market/MarketFields"
import { MarketSubmit } from "@/modules/trade/swap/sections/Market/MarketSubmit"
import { MarketTradeOptions } from "@/modules/trade/swap/sections/Market/MarketTradeOptions"
import { MarketWarnings } from "@/modules/trade/swap/sections/Market/MarketWarnings"
import { MarketSummary } from "@/modules/trade/swap/sections/Market/Summary/MarketSummary"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

export const Market: FC = () => {
  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })
  const { getAsset } = useAssets()

  const submitSwap = useSubmitSwap()
  const submitTwap = useSubmitTwap()

  const form = useMarketForm({ assetIn, assetOut })
  const [type, isSingleTrade] = form.watch(["type", "isSingleTrade"])

  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  const isSell = type === TradeType.Sell

  // We need to preserve component state and focus on changing market type
  const useMarketData = isSell ? useMarketSellData : useMarketBuyData

  const { swap, swapTx, twap, twapTx, healthFactor, isLoading } =
    useMarketData(form)

  const isTradeEnabled = isSingleTrade
    ? !!swap && !swap.swaps.flatMap((swap) => swap.errors).length
    : !!twap && !twap?.errors.length

  const isHealthFactorCheckSatisfied = healthFactor?.isUserConsentRequired
    ? healthFactorRiskAccepted
    : true

  const assetInPriceMeta = getAsset(assetIn)
  const assetOutPriceMeta = getAsset(assetOut)

  const spotPrice = (() => {
    const swapSpotPrice = swap?.spotPrice

    if (!swapSpotPrice) {
      return null
    }

    if (isSell) {
      if (!assetOutPriceMeta) {
        return null
      }

      return Big(1)
        .div(scaleHuman(swapSpotPrice, assetOutPriceMeta.decimals))
        .toString()
    }

    if (!assetInPriceMeta) {
      return null
    }

    return scaleHuman(swapSpotPrice, assetInPriceMeta.decimals)
  })()

  const isExpanded = isLoading || (!!swap && (isSingleTrade || !!twap))

  return (
    <FormProvider {...form}>
      <form
        sx={{ pb: isExpanded ? getTokenPx("containers.paddings.primary") : 0 }}
        onSubmit={form.handleSubmit((values) =>
          isSingleTrade
            ? swap && swapTx && submitSwap.mutate([values, swap, swapTx])
            : twap && twapTx && submitTwap.mutate([values, twap, twapTx]),
        )}
      >
        <MarketFields price={spotPrice} />
        {isExpanded && (
          <Box pt={8} pb={getTokenPx("scales.paddings.m")}>
            <MarketTradeOptions swap={swap} twap={twap} isLoading={isLoading} />
            <MarketWarnings
              isSingleTrade={isSingleTrade}
              twap={twap}
              healthFactor={healthFactor}
              healthFactorRiskAccepted={healthFactorRiskAccepted}
              setHealthFactorRiskAccepted={setHealthFactorRiskAccepted}
            />
            {swap && <MarketErrors swap={swap} />}
          </Box>
        )}
        <SwapSectionSeparator />
        <MarketSubmit
          isSingleTrade={isSingleTrade}
          isLoading={isLoading || submitSwap.isPending || submitTwap.isPending}
          isEnabled={
            isTradeEnabled &&
            isHealthFactorCheckSatisfied &&
            form.formState.isValid
          }
        />
        <MarketSummary
          swapType={type}
          swap={swap}
          swapTx={swapTx}
          twap={twap}
          twapTx={twapTx}
          healthFactor={healthFactor}
          isLoading={isLoading}
        />
      </form>
    </FormProvider>
  )
}
