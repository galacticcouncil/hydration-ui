import {
  HYDRATION_CHAIN_KEY,
  isAddressValidOnChain,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import {
  AssetRoute,
  ConfigBuilder,
  EvmParachain,
} from "@galacticcouncil/xc-core"
import { Transfer } from "@galacticcouncil/xc-sdk"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { FormProvider } from "react-hook-form"
import { prop, unique } from "remeda"

import { getSortedRpcUrlList } from "@/api/rpcConfig"
import {
  useCrossChainBalanceSubscription,
  useCrossChainConfigService,
} from "@/api/xcm"
import { ChainAssetPair } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelect"
import { useTrackApprovals } from "@/modules/xcm/transfer/hooks/useTrackApprovals"
import { useXcmForm } from "@/modules/xcm/transfer/hooks/useXcmForm"
import { XcmContext } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { useXcmTransfer } from "@/modules/xcm/transfer/hooks/useXcmTransfer"
import { useXcmTransferAlerts } from "@/modules/xcm/transfer/hooks/useXcmTransferAlerts"
import {
  resolveValidBridgeProvider,
  shouldPreserveSnowbridgeSubSelection,
} from "@/modules/xcm/transfer/utils/bridge"
import {
  isAccountValidOnChain,
  withCustomChainRpcUrls,
  XCM_CHAINS,
} from "@/modules/xcm/transfer/utils/chain"
import {
  calculateTransferDestAmount,
  getTransferStatus,
  getXcmTransferArgs,
  isDestRouteSynced,
  requiresEvmBinding,
  resolveBestDestRoute,
  resolveSelectedRoute,
} from "@/modules/xcm/transfer/utils/transfer"
import { useProviderRpcUrlStore } from "@/states/provider"

type XcmProviderProps = {
  children: React.ReactNode
}

export const XcmProvider: React.FC<XcmProviderProps> = ({ children }) => {
  const { account } = useAccount()
  const queryClient = useQueryClient()
  const [transfer, setTransfer] = useState<Transfer | null>(null)
  const { rpcUrl, rpcUrlList } = useProviderRpcUrlStore()

  const form = useXcmForm(transfer)

  const configService = useCrossChainConfigService()

  const values = form.watch()

  const {
    srcChain,
    srcAsset,
    destChain,
    destAsset,
    srcAmount,
    destAddress,
    bridgeProvider,
  } = values

  const config = useMemo(
    () => ConfigBuilder(configService).assets(),
    [configService],
  )

  const sourceChainAssetPairs = useMemo<ChainAssetPair[]>(() => {
    return XCM_CHAINS.map((chain) => {
      const assets = [...chain.assetsData.values()]
        .map(({ asset }) => asset)
        .filter((asset) => {
          const assetSource = config.asset(asset).source(chain)
          return assetSource.destinationChains.length > 0
        })
      return { chain, routes: [], assets, isTagSelect: false }
    })
  }, [config])

  const destChainAssetPairs = useMemo<ChainAssetPair[]>(() => {
    const { routes } = configService
    const srcChainRoutes = routes.get(srcChain?.key ?? "")

    if (!srcAsset || !srcChain || !srcChainRoutes) {
      return []
    }

    const srcChainAssetRoutes = srcChainRoutes.getRoutes()

    const destWhitelist = new Set(XCM_CHAINS.map(prop("key")))
    const destChains = srcChainAssetRoutes
      .filter(
        (a) =>
          a.source.asset.key === srcAsset.key &&
          destWhitelist.has(a.destination.chain.key),
      )
      .map((a) => a.destination.chain)

    return unique(destChains).map((chain) => {
      const { routes, destinationAssets, isTagSelect } = config
        .asset(srcAsset)
        .source(srcChain)
        .destination(chain)

      return { chain, routes, assets: destinationAssets, isTagSelect }
    })
  }, [config, srcAsset, srcChain, configService])

  const destPair = destChainAssetPairs.find(
    (p) => p.chain.key === destChain?.key,
  )

  // The SDK only sets isTagSelect when every route in the pair delivers the
  // same destination asset (e.g. outbound Snowbridge V2/V1, all → ETH).
  // Inbound, Snowbridge and Wormhole deliver *different* assets, so the pair
  // is isAssetSelect and isTagSelect is false — yet once a destination asset
  // is picked there can still be multiple bridge variants for it (Snowbridge
  // V2 + V1). Surface those by falling back to the routes matching the
  // selected destination asset.
  const availableBridgeRoutes = useMemo<AssetRoute[]>(() => {
    if (!destPair) return []
    if (destPair.isTagSelect) return destPair.routes
    const forDestAsset = destPair.routes.filter(
      (r) => r.destination.asset.key === destAsset?.key,
    )
    return forDestAsset.length > 1 ? forDestAsset : []
  }, [destPair, destAsset?.key])

  const selectedRoute = useMemo(
    () => resolveSelectedRoute(destPair, destAsset, bridgeProvider),
    [destPair, destAsset, bridgeProvider],
  )

  const requiresBinding = requiresEvmBinding(
    selectedRoute,
    destChain,
    destAddress,
  )

  useEffect(() => {
    if (!destPair || !destAsset) return

    const matchingRoutes = destPair.routes.filter(
      (r) => r.destination.asset.key === destAsset.key,
    )

    if (!matchingRoutes.length) return

    if (shouldPreserveSnowbridgeSubSelection(bridgeProvider, destPair)) return

    const validProvider = resolveValidBridgeProvider(
      bridgeProvider,
      matchingRoutes,
    )
    if (validProvider !== bridgeProvider) {
      form.setValue("bridgeProvider", validProvider)
    }
  }, [bridgeProvider, destPair, destAsset, form])

  useEffect(() => {
    const bestRoute = resolveBestDestRoute(
      destChainAssetPairs,
      destChain,
      destAsset,
    )

    if (!bestRoute) {
      form.setValue("destChain", null)
      form.setValue("destAsset", null)
      return
    }

    const routeSynced = isDestRouteSynced(bestRoute, destChain, destAsset)

    if (routeSynced) {
      const destAddress = form.getValues("destAddress")

      if (
        destChain &&
        destAddress &&
        !isAddressValidOnChain(destAddress, destChain)
      ) {
        form.setValue("destAddress", "")
        form.setValue("destAccount", null)
      }
      return
    }

    const bestAsset = bestRoute.destination.asset
    const bestChain = bestRoute.destination.chain

    const destAddress = form.getValues("destAddress")

    if (!isAddressValidOnChain(destAddress, bestChain)) {
      form.setValue("destAddress", "")
      form.setValue("destAccount", null)
    }

    form.setValue("destChain", bestChain)
    form.setValue("destAsset", bestAsset)
  }, [destAsset, destChain, destChainAssetPairs, form])

  const isConnectedAccountValid =
    !!srcChain && isAccountValidOnChain(account, srcChain)

  const srcAddress = isConnectedAccountValid ? account.address : ""
  const srcChainKey = srcChain?.key ?? ""
  const destChainKey = destChain?.key ?? ""

  const bestDestRoute = useMemo(
    () => resolveBestDestRoute(destChainAssetPairs, destChain, destAsset),
    [destChainAssetPairs, destChain, destAsset],
  )

  const isDestSynced = isDestRouteSynced(bestDestRoute, destChain, destAsset)

  const transferArgs = useMemo(() => {
    if (!isDestSynced) return null

    return getXcmTransferArgs(account, values)
  }, [account, isDestSynced, values])

  const {
    transfer: xcmTransfer,
    isLoadingTransfer,
    isLoadingCall,
    call,
    dryRunError,
    report,
  } = useXcmTransfer(form, transferArgs)

  const { alerts, isLoading: isLoadingAlerts } = useXcmTransferAlerts(
    form,
    report,
    requiresBinding,
  )

  useEffect(() => {
    setTransfer(xcmTransfer)
    form.setValue(
      "destAmount",
      srcAsset && srcAmount && xcmTransfer
        ? calculateTransferDestAmount(srcAsset, srcAmount, xcmTransfer)
        : "",
    )
  }, [form, srcAmount, srcAsset, xcmTransfer])

  // Only the assets actually in view are subscribed now - the asset picker
  // fetches the full set on its own.
  const srcSubscribedAssets = useMemo(
    () => (srcAsset ? [srcAsset] : []),
    [srcAsset],
  )
  const destSubscribedAssets = useMemo(
    () => (destAsset ? [destAsset] : []),
    [destAsset],
  )

  const { isLoading: isLoadingSrcBalances } = useCrossChainBalanceSubscription(
    srcAddress,
    srcChainKey,
    srcSubscribedAssets,
    () => {
      queryClient.invalidateQueries({ queryKey: ["xcm", "transfer"] })
    },
  )
  const { isLoading: isLoadingDestBalances } = useCrossChainBalanceSubscription(
    destAddress,
    destChainKey,
    destSubscribedAssets,
  )

  const registryChain = useMemo(() => {
    const chain = chainsMap.get(HYDRATION_CHAIN_KEY) as EvmParachain
    return withCustomChainRpcUrls(
      chain,
      getSortedRpcUrlList(rpcUrlList, rpcUrl),
    )
  }, [rpcUrl, rpcUrlList])

  useTrackApprovals(srcChainKey)

  const isLoadingBalances = isLoadingSrcBalances || isLoadingDestBalances
  const isLoading = isLoadingTransfer || isLoadingBalances || isLoadingAlerts

  return (
    <XcmContext.Provider
      value={{
        isLoading,
        isLoadingBalances,
        isLoadingCall,
        isLoadingTransfer,
        isLoadingSrcBalances,
        isLoadingDestBalances,
        isConnectedAccountValid,
        sourceChainAssetPairs,
        destChainAssetPairs,
        availableBridgeRoutes,
        selectedRoute,
        transferArgs,
        alerts,
        transfer,
        call,
        dryRunError,
        registryChain,
        status: getTransferStatus(form.getValues(), transfer, call, alerts),
      }}
    >
      <FormProvider {...form}>{children}</FormProvider>
    </XcmContext.Provider>
  )
}
