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
  getTransferStatus,
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

  const [srcChain, srcAsset, destChain, destAsset, srcAmount, destAddress] =
    form.watch([
      "srcChain",
      "srcAsset",
      "destChain",
      "destAsset",
      "srcAmount",
      "destAddress",
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
      return { chain, routes: [], assets }
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
      const { routes } = config
        .asset(srcAsset)
        .source(srcChain)
        .destination(chain)

      return { chain, routes, assets: routes.map((r) => r.destination.asset) }
    })
  }, [config, srcAsset, srcChain, configService])

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
