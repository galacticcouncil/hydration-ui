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
  resolveValidBridgeProvider,
  shouldPreserveSnowbridgeFastSelection,
} from "@/modules/xcm/transfer/utils/bridge"
import {
  getChainPriority,
  isAccountValidOnChain,
  XCM_CHAINS,
} from "@/modules/xcm/transfer/utils/chain"
import {
  calculateTransferDestAmount,
  getTransferStatus,
  getXcmTransferArgs,
} from "@/modules/xcm/transfer/utils/transfer"

type XcmProviderProps = {
  children: React.ReactNode
}

export const XcmProvider: React.FC<XcmProviderProps> = ({ children }) => {
  const { account } = useAccount()
  const queryClient = useQueryClient()
  const [transfer, setTransfer] = useState<Transfer | null>(null)

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

  useEffect(() => {
    if (!destPair || !destAsset) return

    const matchingRoutes = destPair.routes.filter(
      (r) => r.destination.asset.key === destAsset.key,
    )

    if (!matchingRoutes.length) return

    if (shouldPreserveSnowbridgeFastSelection(bridgeProvider, destPair)) return

    const validProvider = resolveValidBridgeProvider(
      bridgeProvider,
      matchingRoutes,
    )
    if (validProvider !== bridgeProvider) {
      form.setValue("bridgeProvider", validProvider)
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

  const transferArgs = useMemo(
    () => getXcmTransferArgs(account, values),
    [account, values],
  )

  const {
    transfer: xcmTransfer,
    isLoadingTransfer,
    isLoadingCall,
    call,
    dryRunError,
    report,
  } = useXcmTransfer(form, transferArgs)

  const alerts = useXcmTransferAlerts(form, report)

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
        transferArgs,
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
