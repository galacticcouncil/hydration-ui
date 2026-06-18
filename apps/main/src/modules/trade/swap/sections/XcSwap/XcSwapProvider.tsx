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
import { isNumber } from "remeda"

import { bestSellQuery, Trade, TradeType } from "@/api/trade"
import { getXcSwapChainLogoUrl, XC_SWAP_CONFIG } from "@/config/xcSwap"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useSubmitSwap } from "@/modules/trade/swap/sections/Market/lib/useSubmitSwap"
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
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { NATIVE_ASSET_ID } from "@/utils/consts"
import { scale, scaleHuman } from "@/utils/formatting"

const QUOTE_SLIPPAGE = 1

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
  | { kind: "oc"; trade: Trade }
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
  onSubmit: () => {},
  isLoading: false,
  alerts: [],
})

export const useXcSwap = () => useContext(XcSwapContext)

type XcSwapProviderProps = {
  children: React.ReactNode
}

export const XcSwapProvider: React.FC<XcSwapProviderProps> = ({ children }) => {
  const rpc = useRpcProvider()
  const { sdk, isApiLoaded } = rpc
  const { getAsset } = useAssets()
  const { account } = useAccount()
  const form = useXcSwapForm()
  const submit = useSubmitXcSwap()
  const submitOmnipool = useSubmitSwap()

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

  useEffect(() => {
    if (!isSelectionDataReady) return

    const source =
      getDefaultChainAssetPair(
        sourceChainAssetPairs,
        XC_SWAP_CONFIG.defaults.source,
      ) ?? sourceChainAssetPairs[0]
    const { srcChain, srcAsset } = form.getValues()

    if (source && (!srcChain || !srcAsset)) {
      form.setValue("srcChain", source.chain)
      form.setValue("srcAsset", source.asset)
    }
  }, [isSelectionDataReady, sourceChainAssetPairs, form])

  useEffect(() => {
    if (!isSelectionDataReady) return

    const dest =
      getDefaultChainAssetPair(
        destChainAssetPairs,
        XC_SWAP_CONFIG.defaults.destination,
      ) ?? destChainAssetPairs[0]
    const { destChain, destAsset } = form.getValues()

    if (dest && (!destChain || !destAsset)) {
      form.setValue("destChain", dest.chain)
      form.setValue("destAsset", dest.asset)
    }
  }, [isSelectionDataReady, destChainAssetPairs, form])

  const destChain = form.watch("destChain")
  const isCrossChain = destChain?.platform !== "hydration"
  const alerts = useXcSwapAlerts(isCrossChain)

  useEffect(() => {
    if (form.getValues("destAddress")) form.trigger("destAddress")
  }, [destChain, form])

  // Live dry quote — debounce the source amount, then estimate via the SDK.
  const srcAsset = form.watch("srcAsset")
  const destAsset = form.watch("destAsset")
  const srcAmount = form.watch("srcAmount")
  const recipient = form.watch("destAddress")

  const [debouncedAmount, setDebouncedAmount] = useState("")
  useDebounce(() => setDebouncedAmount(srcAmount), 400, [srcAmount])

  const amountIn = useMemo(() => {
    if (!srcAsset || !debouncedAmount || Number(debouncedAmount) <= 0) {
      return null
    }
    return BigInt(scale(debouncedAmount, srcAsset.decimals))
  }, [debouncedAmount, srcAsset])

  // Cross-chain (xc-swap SDK) quote — needs refund/recipient addresses.
  const xcQuoteEnabled =
    isCrossChain &&
    isApiLoaded &&
    !!refundTo &&
    !!recipient &&
    isNumber(srcAsset?.id) &&
    !!destAsset?.oneClickId &&
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
      srcAsset?.id,
      amountIn?.toString(),
      destAsset?.oneClickId,
      recipient,
      refundTo,
      QUOTE_SLIPPAGE,
    ],
    queryFn: () =>
      xcSwap.swap(
        assertXcSwapQuoteParams({
          srcAsset,
          amountIn,
          destAsset,
          recipient,
          refundTo,
          slippage: QUOTE_SLIPPAGE,
        }),
      ),
  })

  const omnipoolQueryOptions = bestSellQuery(rpc, {
    assetIn: isNumber(srcAsset?.id) ? String(srcAsset.id) : "",
    assetOut: isNumber(destAsset?.id) ? String(destAsset.id) : "",
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

  const quote = useMemo<XcSwapQuote>(() => {
    if (isCrossChain) return xcTrade ? { kind: "xc", trade: xcTrade } : null
    return omnipoolTrade ? { kind: "oc", trade: omnipoolTrade } : null
  }, [isCrossChain, xcTrade, omnipoolTrade])

  const isQuoteLoading = isCrossChain
    ? isXcQuoteLoading
    : isOmnipoolQuoteLoading
  const quoteError = isCrossChain ? xcQuoteError : omnipoolQuoteError

  useEffect(() => {
    if (quote?.kind === "xc") {
      form.setValue("destAmount", quote.trade.amountOut.toDecimal(), {
        shouldValidate: true,
      })
    } else if (quote?.kind === "oc" && destAsset) {
      form.setValue(
        "destAmount",
        scaleHuman(quote.trade.amountOut, destAsset.decimals),
        { shouldValidate: true },
      )
    } else if (form.getValues("destAmount")) {
      form.setValue("destAmount", "", { shouldValidate: true })
    }
  }, [quote, destAsset, form])

  const srcAssetUnsupported =
    !!srcAsset &&
    originAssetMap.size > 0 &&
    !originAssetMap.has(String(srcAsset.id))

  const allAlerts = useMemo<XcSwapAlert[]>(() => {
    const result = [...alerts]
    if (srcAssetUnsupported) {
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
  }, [alerts, quoteError, srcAssetUnsupported])

  const toMarketFormValues = (values: XcSwapFormValues): MarketFormValues => ({
    sellAsset: values.srcAsset
      ? (getAsset(String(values.srcAsset.id)) ?? null)
      : null,
    sellAmount: values.srcAmount,
    buyAsset: values.destAsset
      ? (getAsset(String(values.destAsset.id)) ?? null)
      : null,
    buyAmount: values.destAmount,
    type: TradeType.Sell,
    isSingleTrade: true,
  })

  const onSubmit = (values: XcSwapFormValues) => {
    if (quote?.kind === "xc") {
      submit.mutate([values, quote.trade])
    } else if (quote?.kind === "oc") {
      submitOmnipool.mutate([toMarketFormValues(values), quote.trade])
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
        onSubmit,
        isLoading:
          isOriginLoading ||
          isDestLoading ||
          submit.isPending ||
          submitOmnipool.isPending,
        alerts: allAlerts,
      }}
    >
      <FormProvider {...form}>{children}</FormProvider>
    </XcSwapContext.Provider>
  )
}
