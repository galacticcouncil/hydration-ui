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
  useZcashRoutes,
} from "@/api/xcm"
import { ChainAssetPair } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelect"
import { useTrackApprovals } from "@/modules/xcm/transfer/hooks/useTrackApprovals"
import { useXcmForm } from "@/modules/xcm/transfer/hooks/useXcmForm"
import { XcmContext } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { useXcmTransfer } from "@/modules/xcm/transfer/hooks/useXcmTransfer"
import { useXcmTransferAlerts } from "@/modules/xcm/transfer/hooks/useXcmTransferAlerts"
import { useZecWithdrawalAlerts } from "@/modules/xcm/transfer/hooks/useZecWithdrawal"
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
  isDestinationSynced,
  requiresEvmBinding,
  resolveBestDestination,
  resolveSelectedRoute,
} from "@/modules/xcm/transfer/utils/transfer"
import { findZcashRoute } from "@/modules/xcm/transfer/utils/zcash"
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
  const zcashRoutes = useZcashRoutes()

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
      // The sdk throws on a source without routes, which Zcash is
      const isRouted = configService.routes.has(chain.key)
      const assets = [...chain.assetsData.values()]
        .map(({ asset }) => asset)
        .filter((asset) => {
          const isZcashSource = zcashRoutes.some(
            ({ source }) =>
              source.chain.key === chain.key && source.asset.key === asset.key,
          )
          if (isZcashSource) return true
          if (!isRouted) return false
          const assetSource = config.asset(asset).source(chain)
          return assetSource.destinationChains.length > 0
        })
      return { chain, routes: [], assets, isTagSelect: false }
    })
  }, [config, configService, zcashRoutes])

  const destChainAssetPairs = useMemo<ChainAssetPair[]>(() => {
    const { routes } = configService
    const srcChainRoutes = routes.get(srcChain?.key ?? "")

    if (!srcAsset || !srcChain) {
      return []
    }

    // No routes to select: xc-swap builds the transfer
    const zcashPairs = zcashRoutes
      .filter(
        ({ source }) =>
          source.chain.key === srcChain.key &&
          source.asset.key === srcAsset.key,
      )
      .map(({ destination }) => ({
        chain: destination.chain,
        routes: [],
        assets: [destination.asset],
        isTagSelect: false,
      }))

    if (!srcChainRoutes) {
      return zcashPairs
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

    return [
      ...unique(destChains).map((chain) => {
        const { routes, destinationAssets, isTagSelect } = config
          .asset(srcAsset)
          .source(srcChain)
          .destination(chain)

        return { chain, routes, assets: destinationAssets, isTagSelect }
      }),
      ...zcashPairs,
    ]
  }, [config, srcAsset, srcChain, configService, zcashRoutes])

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

  const zcashRoute = findZcashRoute(zcashRoutes, {
    srcChain: srcChain?.key,
    srcAsset: srcAsset?.key,
    destChain: destChain?.key,
    destAsset: destAsset?.key,
  })

  // A Zcash deposit lands over the ntt route from NEAR, so binds like it
  const requiresBinding = requiresEvmBinding(
    selectedRoute ?? zcashRoute?.hub ?? null,
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
    const bestDest = resolveBestDestination(
      destChainAssetPairs,
      destChain,
      destAsset,
    )

    if (!bestDest) {
      form.setValue("destChain", null)
      form.setValue("destAsset", null)
      return
    }

    const destSynced = isDestinationSynced(bestDest, destChain, destAsset)

    if (destSynced) {
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

    const bestAsset = bestDest.asset
    const bestChain = bestDest.chain

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

  const bestDest = useMemo(
    () => resolveBestDestination(destChainAssetPairs, destChain, destAsset),
    [destChainAssetPairs, destChain, destAsset],
  )

  const isDestSynced = isDestinationSynced(bestDest, destChain, destAsset)

  const transferArgs = useMemo(() => {
    if (!isDestSynced) return null

    return getXcmTransferArgs(account, values)
  }, [account, isDestSynced, values])

  const {
    transfer: xcmTransfer,
    isLoadingTransfer,
    isLoadingCall,
    isLoadingReport,
    call,
    dryRunError,
    report,
  } = useXcmTransfer(form, transferArgs)

  const { alerts: transferAlerts, isLoading: isLoadingAlerts } =
    useXcmTransferAlerts(form, report, requiresBinding)

  const zecWithdrawalAlerts = useZecWithdrawalAlerts(zcashRoute)
  const alerts = [...transferAlerts, ...zecWithdrawalAlerts]

  useEffect(() => {
    setTransfer(xcmTransfer)
    form.setValue(
      "destAmount",
      srcAsset && srcAmount && xcmTransfer
        ? calculateTransferDestAmount(
            srcAsset,
            srcAmount,
            xcmTransfer,
            !!selectedRoute?.destination.fee.prepaid,
          )
        : "",
    )
  }, [form, selectedRoute, srcAmount, srcAsset, xcmTransfer])

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
  // Only the report checks an Omni deposit or a 1Click withdrawal against its
  // minimum and the NEAR leg's limits, neither of which can be undone, so
  // submit waits for it
  const isLoadingBridgeReport = !!zcashRoute && isLoadingReport
  const isLoading =
    isLoadingTransfer ||
    isLoadingBalances ||
    isLoadingAlerts ||
    isLoadingBridgeReport

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
        zcashRoute,
        transferArgs,
        alerts,
        transfer,
        call,
        dryRunError,
        registryChain,
        status: getTransferStatus(
          form.getValues(),
          transfer,
          call,
          alerts,
          !!zcashRoute,
        ),
      }}
    >
      <FormProvider {...form}>{children}</FormProvider>
    </XcmContext.Provider>
  )
}
