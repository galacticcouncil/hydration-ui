import { isH160Address } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import {
  createXcSwap,
  XcSwapAsset,
  XcSwapChain,
  XcSwapClient,
  XcSwapTrade,
} from "@galacticcouncil/xc-swap"
import { useQuery } from "@tanstack/react-query"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { FormProvider } from "react-hook-form"
import { useDebounce } from "react-use"

import {
  bestSellQuery,
  bestSellTwapQuery,
  Trade,
  TradeOrder,
  TradeType,
} from "@/api/trade"
import {
  getXcSwapChainLogoUrl,
  XC_SWAP_CONFIG,
  XC_SWAP_RECIPIENT_PLACEHOLDERS,
} from "@/config/xcSwap"
import { isTwapEnabled } from "@/modules/trade/swap/sections/Market/lib/isTwapEnabled"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useSubmitSwap } from "@/modules/trade/swap/sections/Market/lib/useSubmitSwap"
import { useSubmitTwap } from "@/modules/trade/swap/sections/Market/lib/useSubmitTwap"
import {
  addressValidatorFor,
  XcAsset,
  XcChain,
  XcChainAssetPair,
} from "@/modules/trade/swap/sections/XcSwap/data/mock"
import { useSubmitXcSwap } from "@/modules/trade/swap/sections/XcSwap/hooks/useSubmitXcSwap"
import {
  useXcSwapAlerts,
  XcSwapAlert,
} from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapAlerts"
import {
  useXcSwapForm,
  XcSwapFormValues,
} from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { assertXcSwapQuoteParams } from "@/modules/trade/swap/sections/XcSwap/lib/assertXcSwapQuoteParams"
import {
  findXcChainAssetPair,
  isXcDestAsset,
  sellAssetToXcAsset,
} from "@/modules/trade/swap/sections/XcSwap/lib/xcSwapAssets"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { NATIVE_ASSET_ID } from "@/utils/consts"
import { scale, scaleHuman } from "@/utils/formatting"

type XcSwapDefaultSelection = {
  readonly chainKey: string
  readonly assetId: string
}

const getDefaultChainAssetPair = (
  pairs: XcChainAssetPair[],
  defaultSelection: XcSwapDefaultSelection,
) =>
  pairs.find(
    ({ chain, asset }) =>
      chain.key === defaultSelection.chainKey &&
      ((asset.id !== undefined &&
        String(asset.id) === defaultSelection.assetId) ||
        asset.key === defaultSelection.assetId ||
        asset.oneClickId === defaultSelection.assetId),
  )

export type XcSwapQuote =
  | { kind: "xc"; trade: XcSwapTrade }
  | { kind: "oc"; trade: Trade; twap: TradeOrder | undefined }
  | null

type XcSwapContextValue = {
  readonly xcSwap: XcSwapClient | null
  readonly sourceChainAssetPairs: XcChainAssetPair[]
  readonly originAssetMap: Map<string, XcAsset>
  readonly destChainAssetPairs: XcChainAssetPair[]
  readonly isCrossChain: boolean
  readonly refundTo: string | null
  readonly quote: XcSwapQuote
  readonly isQuoteLoading: boolean
  readonly isTwapLoading: boolean
  readonly isSelectionLoading: boolean
  readonly onSubmit: (values: XcSwapFormValues) => void
  readonly isLoading: boolean
  readonly alerts: XcSwapAlert[]
}

const XcSwapContext = createContext<XcSwapContextValue>({
  xcSwap: null,
  sourceChainAssetPairs: [],
  originAssetMap: new Map(),
  destChainAssetPairs: [],
  isCrossChain: true,
  refundTo: null,
  quote: null,
  isQuoteLoading: false,
  isTwapLoading: false,
  isSelectionLoading: true,
  onSubmit: () => {},
  isLoading: false,
  alerts: [],
})

export const useXcSwap = () => useContext(XcSwapContext)

type XcSwapProviderProps = {
  children: React.ReactNode
  assetIn: string
  assetOut: string
}

export const XcSwapProvider: React.FC<XcSwapProviderProps> = ({
  children,
  assetIn,
  assetOut,
}) => {
  const rpc = useRpcProvider()
  const { sdk, isApiLoaded } = rpc
  const { getAsset } = useAssets()
  const { account } = useAccount()
  const form = useXcSwapForm()
  const submit = useSubmitXcSwap()
  const submitOmnipool = useSubmitSwap()
  const submitTwap = useSubmitTwap()
  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()

  // EVM-wallet-only (phase 1): the H160 comes straight from the connected
  // account's raw address. Substrate-account H160 derivation is out of scope.
  const rawAddress = account?.rawAddress
  const refundTo = isH160Address(rawAddress) ? rawAddress : null

  const xcSwap = useMemo(
    () =>
      createXcSwap({
        sdk,
        emitter: XC_SWAP_CONFIG.emitter,
      }),
    [sdk],
  )

  const chains = useMemo<Record<string, XcChain>>(() => {
    const hydrationLogo = getAsset(NATIVE_ASSET_ID)?.iconSrc ?? ""
    return Object.fromEntries(
      xcSwap.getChains().map((chain: XcSwapChain) => [
        chain.key,
        {
          key: chain.key,
          name: chain.name,
          logo:
            chain.platform === "hydration"
              ? hydrationLogo
              : getXcSwapChainLogoUrl(chain.key),
          platform: chain.platform,
          addressValidator: addressValidatorFor(chain.platform),
        },
      ]),
    )
  }, [xcSwap, getAsset])

  const { data: originAssets, isLoading: isOriginLoading } = useQuery({
    queryKey: ["xcSwap", "originAssets"],
    queryFn: () => xcSwap.getOriginAssets(),
    enabled: isApiLoaded,
    staleTime: Infinity,
  })

  const { data: destAssets, isLoading: isDestLoading } = useQuery({
    queryKey: ["xcSwap", "destinationAssets"],
    queryFn: () => xcSwap.getDestinationAssets(),
    enabled: isApiLoaded,
    staleTime: Infinity,
  })

  const sourceChainAssetPairs = useMemo<XcChainAssetPair[]>(() => {
    const hydration = chains["hydration"]
    if (!hydration || !originAssets) return []

    return originAssets.map((asset: XcSwapAsset): XcChainAssetPair => {
      const id = String(asset.id)
      const meta = getAsset(id)

      return {
        chain: hydration,
        asset: {
          key: id,
          symbol: asset.symbol,
          name: meta?.name ?? asset.symbol,
          decimals: asset.decimals,
          logo: meta?.iconSrc ?? "",
          id: asset.id,
          address: asset.address,
        },
      }
    })
  }, [chains, originAssets, getAsset])

  const originAssetMap = useMemo<Map<string, XcAsset>>(
    () =>
      new Map(
        sourceChainAssetPairs.map((pair) => [
          String(pair.asset.id),
          pair.asset,
        ]),
      ),
    [sourceChainAssetPairs],
  )

  const destChainAssetPairs = useMemo<XcChainAssetPair[]>(() => {
    if (!destAssets) return []

    const crossChain = destAssets.reduce<XcChainAssetPair[]>(
      (acc, asset: XcSwapAsset) => {
        const chain = chains[asset.chain]
        if (!chain) return acc

        acc.push({
          chain,
          asset: {
            key: asset.oneClickId ?? asset.key,
            symbol: asset.symbol,
            name: asset.symbol,
            decimals: asset.decimals,
            logo: "",
            oneClickId: asset.oneClickId,
          },
        })
        return acc
      },
      [],
    )

    return [...crossChain, ...sourceChainAssetPairs]
  }, [chains, destAssets, sourceChainAssetPairs])

  const isSelectionDataReady =
    !isOriginLoading && !isDestLoading && sourceChainAssetPairs.length > 0
  const sellAsset = form.watch("sellAsset")
  const buyAsset = form.watch("buyAsset")
  const isSelectionLoading = !isSelectionDataReady || !sellAsset || !buyAsset

  useEffect(() => {
    if (!isSelectionDataReady) return

    const source =
      findXcChainAssetPair(sourceChainAssetPairs, assetIn) ??
      getDefaultChainAssetPair(
        sourceChainAssetPairs,
        XC_SWAP_CONFIG.defaults.source,
      ) ??
      sourceChainAssetPairs[0]
    const { srcChain, sellAsset } = form.getValues()

    if (source && (!srcChain || !sellAsset)) {
      const asset = getAsset(String(source.asset.id))

      if (asset) {
        form.setValue("srcChain", source.chain)
        form.setValue("sellAsset", asset)
      }
    }
  }, [isSelectionDataReady, sourceChainAssetPairs, form, getAsset, assetIn])

  useEffect(() => {
    if (!isSelectionDataReady) return

    const dest =
      findXcChainAssetPair(destChainAssetPairs, assetOut) ??
      getDefaultChainAssetPair(
        destChainAssetPairs,
        XC_SWAP_CONFIG.defaults.destination,
      ) ??
      destChainAssetPairs[0]
    const { destChain, buyAsset } = form.getValues()

    if (dest && (!destChain || !buyAsset)) {
      form.setValue("destChain", dest.chain)
      form.setValue("buyAsset", dest.asset)
    }
  }, [isSelectionDataReady, destChainAssetPairs, form, assetOut])

  const destChain = form.watch("destChain")
  const isCrossChain = destChain?.platform !== "hydration"
  const alerts = useXcSwapAlerts(isCrossChain)
  const isSingleTrade = form.watch("isSingleTrade")

  useEffect(() => {
    if (isCrossChain && !form.getValues("isSingleTrade")) {
      form.setValue("isSingleTrade", true)
    }
  }, [isCrossChain, form])

  useEffect(() => {
    if (form.getValues("destAddress")) {
      form.trigger("destAddress")
    }
  }, [destChain, form])

  const sellAmount = form.watch("sellAmount")
  const destAddress = form.watch("destAddress")
  const recipient =
    destAddress.trim() ||
    (destChain ? XC_SWAP_RECIPIENT_PLACEHOLDERS[destChain.key] : undefined)

  const [debouncedAmount, setDebouncedAmount] = useState("")
  useDebounce(() => setDebouncedAmount(sellAmount), 400, [sellAmount])

  const amountIn = useMemo(() => {
    if (!sellAsset || !debouncedAmount || Number(debouncedAmount) <= 0) {
      return null
    }
    return BigInt(scale(debouncedAmount, sellAsset.decimals))
  }, [debouncedAmount, sellAsset])

  const xcQuoteEnabled =
    isCrossChain &&
    isApiLoaded &&
    !!refundTo &&
    !!recipient &&
    !!sellAsset &&
    isXcDestAsset(buyAsset) &&
    amountIn !== null &&
    amountIn > 0n

  const {
    data: xcTrade,
    isFetching: isXcQuoteLoading,
    error: xcQuoteError,
  } = useQuery({
    enabled: xcQuoteEnabled,
    retry: false,
    queryKey: [
      "xcSwap",
      "quote",
      sellAsset?.id,
      amountIn?.toString(),
      isXcDestAsset(buyAsset) ? buyAsset.oneClickId : undefined,
      recipient,
      refundTo,
      swapSlippage,
    ],
    queryFn: () => {
      if (!sellAsset) {
        throw new Error("Source asset is required")
      }

      return xcSwap.swap(
        assertXcSwapQuoteParams({
          srcAsset: sellAssetToXcAsset(sellAsset, originAssetMap),
          amountIn,
          destAsset: buyAsset,
          recipient,
          refundTo,
          slippage: swapSlippage,
        }),
      )
    },
  })

  const omnipoolQueryOptions = bestSellQuery(rpc, {
    assetIn: sellAsset?.id ?? "",
    assetOut: buyAsset?.id !== undefined ? String(buyAsset.id) : "",
    amountIn: debouncedAmount,
  })
  const {
    data: omnipoolTrade,
    isFetching: isOmnipoolQuoteLoading,
    error: omnipoolQuoteError,
  } = useQuery({
    ...omnipoolQueryOptions,
    enabled: !isCrossChain && omnipoolQueryOptions.enabled,
  })

  const { data: twap, isFetching: isTwapLoading } = useQuery(
    bestSellTwapQuery(
      rpc,
      {
        assetIn: sellAsset?.id ?? "",
        assetOut: buyAsset?.id !== undefined ? String(buyAsset.id) : "",
        amountIn: debouncedAmount,
      },
      !isCrossChain && isTwapEnabled(omnipoolTrade),
    ),
  )

  const quote = useMemo<XcSwapQuote>(() => {
    if (isCrossChain) return xcTrade ? { kind: "xc", trade: xcTrade } : null
    return omnipoolTrade ? { kind: "oc", trade: omnipoolTrade, twap } : null
  }, [isCrossChain, xcTrade, omnipoolTrade, twap])

  const isQuoteLoading = isCrossChain
    ? isXcQuoteLoading
    : isOmnipoolQuoteLoading
  const quoteError = isCrossChain ? xcQuoteError : omnipoolQuoteError

  useEffect(() => {
    if (quote?.kind === "xc") {
      form.setValue("buyAmount", quote.trade.amountOut.toDecimal(), {
        shouldValidate: true,
      })
    } else if (quote?.kind === "oc" && buyAsset) {
      const amountOut = isSingleTrade
        ? quote.trade.amountOut
        : quote.twap?.amountOut

      form.setValue(
        "buyAmount",
        amountOut ? scaleHuman(amountOut, buyAsset.decimals) : "",
        { shouldValidate: true },
      )
    } else if (form.getValues("buyAmount")) {
      form.setValue("buyAmount", "", { shouldValidate: true })
    }
  }, [quote, buyAsset, form, isSingleTrade])

  const sellAssetUnsupported =
    !!sellAsset && originAssetMap.size > 0 && !originAssetMap.has(sellAsset.id)

  const allAlerts = useMemo<XcSwapAlert[]>(() => {
    const result = [...alerts]
    if (sellAssetUnsupported) {
      result.push({
        key: "src-asset-unsupported",
        message:
          "This asset can't be used as a swap source. Select a different asset.",
        severity: "error",
      })
    }
    if (quoteError) {
      result.push({
        key: "quote-error",
        message: quoteError.message,
        severity: "error",
      })
    }
    return result
  }, [alerts, quoteError, sellAssetUnsupported])

  const toMarketFormValues = (values: XcSwapFormValues): MarketFormValues => ({
    sellAsset: values.sellAsset,
    sellAmount: values.sellAmount,
    buyAsset:
      values.buyAsset?.id !== undefined
        ? (getAsset(String(values.buyAsset.id)) ?? null)
        : null,
    buyAmount: values.buyAmount,
    type: TradeType.Sell,
    isSingleTrade: values.isSingleTrade,
  })

  const onSubmit = (values: XcSwapFormValues) => {
    if (quote?.kind === "xc") {
      submit.mutate([values, quote.trade])
    } else if (quote?.kind === "oc" && values.isSingleTrade) {
      submitOmnipool.mutate([toMarketFormValues(values), quote.trade])
    } else if (quote?.kind === "oc" && quote.twap) {
      submitTwap.mutate([toMarketFormValues(values), quote.twap])
    }
  }

  return (
    <XcSwapContext.Provider
      value={{
        xcSwap,
        sourceChainAssetPairs,
        originAssetMap,
        destChainAssetPairs,
        isCrossChain,
        refundTo,
        quote,
        isQuoteLoading,
        isTwapLoading,
        isSelectionLoading,
        onSubmit,
        isLoading:
          isOriginLoading ||
          isDestLoading ||
          submit.isPending ||
          submitOmnipool.isPending ||
          submitTwap.isPending,
        alerts: allAlerts,
      }}
    >
      <FormProvider {...form}>{children}</FormProvider>
    </XcSwapContext.Provider>
  )
}
