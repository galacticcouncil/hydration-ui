import {
  HYDRATION_CHAIN_KEY,
  isAddressValidOnChain,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { ConfigBuilder, EvmParachain } from "@galacticcouncil/xc-core"
import { Transfer } from "@galacticcouncil/xc-sdk"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { FormProvider } from "react-hook-form"
import { first, flatMap, pipe, prop, sortBy, unique } from "remeda"

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
  getChainPriority,
  isAccountValidOnChain,
  XCM_CHAINS,
} from "@/modules/xcm/transfer/utils/chain"
import {
  calculateTransferDestAmount,
  getPrimaryBridgeTag,
  getTransferStatus,
  hasSnowbridgeVariantChoice,
  isSnowbridgeFastTag,
  isSnowbridgeRoute,
} from "@/modules/xcm/transfer/utils/transfer"
import { XcmTag } from "@/states/transactions"

type XcmProviderProps = {
  children: React.ReactNode
}

export const XcmProvider: React.FC<XcmProviderProps> = ({ children }) => {
  const { account } = useAccount()
  const queryClient = useQueryClient()
  const [transfer, setTransfer] = useState<Transfer | null>(null)

  const form = useXcmForm(transfer)

  const configService = useCrossChainConfigService()

  const [
    srcChain,
    srcAsset,
    destChain,
    destAsset,
    srcAmount,
    destAddress,
    bridgeProvider,
  ] = form.watch([
    "srcChain",
    "srcAsset",
    "destChain",
    "destAsset",
    "srcAmount",
    "destAddress",
    "bridgeProvider",
  ])

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

  useEffect(() => {
    if (!destPair) return

    const hasSnowbridgeRoute = destPair.routes.some(isSnowbridgeRoute)
    if (!destPair.isTagSelect && !hasSnowbridgeRoute) {
      form.setValue("bridgeProvider", null)
      return
    }

    const hasFastVariant = destPair.routes.some((r) =>
      (r.tags ?? []).includes(XcmTag.SnowbridgeFast),
    )
    const isAlreadyValid =
      (isSnowbridgeFastTag(bridgeProvider) && hasFastVariant) ||
      destPair.routes.some((r) => getPrimaryBridgeTag(r) === bridgeProvider)
    if (isAlreadyValid) return

    const defaultRoute =
      destPair.routes.find((r) => getPrimaryBridgeTag(r) === XcmTag.Basejump) ??
      destPair.routes[0]
    if (defaultRoute)
      form.setValue("bridgeProvider", getPrimaryBridgeTag(defaultRoute))
  }, [destPair, bridgeProvider, form])

  useEffect(() => {
    if (!destPair || !destAsset) return

    const route = destPair.routes.find(
      (r) => r.destination.asset.key === destAsset.key,
    )
    const tag = route ? getPrimaryBridgeTag(route) : null
    if (!tag) return

    // Keep an explicit SnowbridgeFast selection — both fast and slow share
    // the same destAsset, so don't downgrade fast → slow on resync.
    if (
      isSnowbridgeFastTag(bridgeProvider) &&
      destPair.routes.some((r) => (r.tags ?? []).includes(XcmTag.SnowbridgeFast))
    ) {
      return
    }

    if (tag !== bridgeProvider) {
      form.setValue("bridgeProvider", tag)
    }
  }, [bridgeProvider, destPair, destAsset, form])

  useEffect(() => {
    const validRoutes = pipe(
      destChainAssetPairs,
      flatMap((c) => c.routes),
      sortBy((r) => getChainPriority(r.destination.chain.key)),
    )

    const foundRoute = validRoutes.find(
      (r) =>
        r.destination.chain.key === destChain?.key &&
        r.destination.asset.key === destAsset?.key,
    )

    const bestRoute = foundRoute || first(validRoutes)

    if (!bestRoute) {
      form.setValue("destChain", null)
      form.setValue("destAsset", null)
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
  }, [destAsset?.key, destChain?.key, destChainAssetPairs, form, srcAsset?.key])

  const isConnectedAccountValid =
    !!srcChain && isAccountValidOnChain(account, srcChain)

  const srcAddress = isConnectedAccountValid ? account.address : ""
  const srcChainKey = srcChain?.key ?? ""
  const destChainKey = destChain?.key ?? ""

  const {
    transfer: xcmTransfer,
    isLoadingTransfer,
    isLoadingCall,
    call,
    dryRunError,
    report,
  } = useXcmTransfer(form)

  const alerts = useXcmTransferAlerts(report)

  useEffect(() => {
    setTransfer(xcmTransfer)
    form.setValue(
      "destAmount",
      srcAsset && srcAmount && xcmTransfer
        ? calculateTransferDestAmount(srcAsset, srcAmount, xcmTransfer)
        : "",
    )
  }, [form, srcAmount, srcAsset, xcmTransfer])

  const { isLoading: isLoadingSrcBalances } = useCrossChainBalanceSubscription(
    srcAddress,
    srcChainKey,
    () => {
      queryClient.invalidateQueries({ queryKey: ["xcm", "transfer"] })
    },
  )
  const { isLoading: isLoadingDestBalances } = useCrossChainBalanceSubscription(
    destAddress,
    destChainKey,
  )

  useTrackApprovals(srcChainKey)

  const isLoading =
    isLoadingTransfer || isLoadingSrcBalances || isLoadingDestBalances

  return (
    <XcmContext.Provider
      value={{
        isLoading,
        isLoadingCall,
        isLoadingTransfer,
        isConnectedAccountValid,
        sourceChainAssetPairs,
        destChainAssetPairs,
        availableBridgeRoutes: destPair?.isTagSelect ? destPair.routes : [],
        hasSnowbridgeVariants: destPair
          ? hasSnowbridgeVariantChoice(destPair.routes)
          : false,
        alerts,
        transfer,
        call,
        dryRunError,
        registryChain: chainsMap.get(HYDRATION_CHAIN_KEY) as EvmParachain,
        status: getTransferStatus(form.getValues(), transfer, call, alerts),
      }}
    >
      <FormProvider {...form}>{children}</FormProvider>
    </XcmContext.Provider>
  )
}
