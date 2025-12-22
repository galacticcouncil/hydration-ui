import {
  HYDRATION_CHAIN_KEY,
  isAddressValidOnChain,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { ConfigBuilder, EvmParachain } from "@galacticcouncil/xc-core"
import { Transfer } from "@galacticcouncil/xc-sdk"
import { useEffect, useMemo, useState } from "react"
import { FormProvider } from "react-hook-form"
import { useShallowCompareEffect } from "react-use"
import { first, isNonNullish, unique, zip } from "remeda"

import {
  useCrossChainBalanceSubscription,
  useCrossChainConfigService,
} from "@/api/xcm"
import { ChainAssetPair } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelect"
import { useXcmForm } from "@/modules/xcm/transfer/hooks/useXcmForm"
import { XcmContext } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { useXcmTransfer } from "@/modules/xcm/transfer/hooks/useXcmTransfer"
import {
  getXcmFormDefaults,
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
  const [transfer, setTransfer] = useState<Transfer | null>(null)

  const form = useXcmForm(transfer)

  const configService = useCrossChainConfigService()

  const [srcChain, srcAsset, destChain, srcAmount, destAddress] = form.watch([
    "srcChain",
    "srcAsset",
    "destChain",
    "srcAmount",
    "destAddress",
  ])

  const config = useMemo(
    () => ConfigBuilder(configService).assets(),
    [configService],
  )

  const sourceChainAssetPairs = useMemo<ChainAssetPair[]>(() => {
    return XCM_CHAINS.map((chain) => {
      const chainAssets = [...chain.assetsData.values()].map(
        (chainAssetData) => chainAssetData.asset,
      )
      const destinations = chainAssets.map((asset) =>
        config.asset(asset).source(chain),
      )
      const assets = zip(chainAssets, destinations)
        .filter(([, destination]) => destination.destinationChains.length > 0)
        .map(([asset]) => asset)
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

    const destWhitelist = XCM_CHAINS.map((c) => c.key)
    const destChains = srcChainAssetRoutes
      .filter(
        (a) =>
          a.source.asset.key === srcAsset.key &&
          destWhitelist.includes(a.destination.chain.key),
      )
      .map((a) => a.destination.chain)

    return unique(destChains)
      .map((chain) => {
        const { routes } = config
          .asset(srcAsset)
          .source(srcChain)
          .destination(chain)

        return { chain, routes, assets: routes.map((r) => r.destination.asset) }
      })
      .filter(isNonNullish)
  }, [config, srcAsset, srcChain, configService])

  useEffect(() => {
    const validRoutes = destChainAssetPairs.flatMap((c) => c.routes)

    const bestRoute =
      validRoutes.find(
        (r) =>
          r.destination.chain.key === destChain?.key &&
          r.destination.asset.key === srcAsset?.key,
      ) || first(validRoutes)

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
  }, [destChainAssetPairs, form, destChain?.key, srcAsset?.key])

  const isConnectedAccountValid =
    !!srcChain && isAccountValidOnChain(account, srcChain)

  const srcAddress = isConnectedAccountValid ? account.address : ""
  const srcChainKey = srcChain?.key ?? ""
  const destChainKey = destChain?.key ?? ""

  const { data: xcmTransfer, isLoading: isLoadingTransfer } =
    useXcmTransfer(form)

  useEffect(() => {
    if (xcmTransfer) {
      setTransfer(xcmTransfer)
      if (srcAsset && srcAmount) {
        form.setValue(
          "destAmount",
          calculateTransferDestAmount(srcAsset, srcAmount, xcmTransfer),
        )
      }
    }
  }, [form, srcAmount, srcAsset, xcmTransfer])

  useShallowCompareEffect(() => {
    form.reset(getXcmFormDefaults(account))
    form.trigger().then(() => form.clearErrors())
  }, [account, form])

  const { isLoading: isLoadingSrcBalances } = useCrossChainBalanceSubscription(
    srcAddress,
    srcChainKey,
  )
  const { isLoading: isLoadingDestBalances } = useCrossChainBalanceSubscription(
    destAddress,
    destChainKey,
  )

  const isLoading =
    isLoadingTransfer || isLoadingSrcBalances || isLoadingDestBalances

  return (
    <XcmContext.Provider
      value={{
        isLoading,
        isConnectedAccountValid,
        sourceChainAssetPairs,
        destChainAssetPairs,
        transfer,
        registryChain: chainsMap.get(HYDRATION_CHAIN_KEY) as EvmParachain,
        status: getTransferStatus(form.getValues(), transfer),
      }}
    >
      <FormProvider {...form}>{children}</FormProvider>
    </XcmContext.Provider>
  )
}
