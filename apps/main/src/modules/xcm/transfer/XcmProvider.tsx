import { isValidAddressOnChain } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { ConfigBuilder, EvmParachain } from "@galacticcouncil/xcm-core"
import { Transfer } from "@galacticcouncil/xcm-sdk"
import Big from "big.js"
import { useEffect, useMemo, useState } from "react"
import { FormProvider } from "react-hook-form"
import { useShallowCompareEffect } from "react-use"
import { isNonNullish, unique, zip } from "remeda"

import {
  useCrossChainBalanceSubscription,
  useHydrationConfigService,
} from "@/api/xcm"
import { ChainAssetPair } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelect"
import { useXcmForm } from "@/modules/xcm/transfer/hooks/useXcmForm"
import { XcmContext } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { useXcmTransfer } from "@/modules/xcm/transfer/hooks/useXcmTransfer"
import { getXcmFormDefaults } from "@/modules/xcm/transfer/utils/chain"
import { XCM_CHAINS } from "@/modules/xcm/transfer/utils/chain"

const getDestinationAmount = (amount: string, transfer: Transfer): string => {
  const { destinationFee } = transfer.source
  const destFee = destinationFee.toDecimal(destinationFee.decimals)
  const amountMinusFee = Big(amount || "0").minus(destFee)
  return amountMinusFee.gt(0) ? amountMinusFee.toString() : ""
}

type XcmProviderProps = {
  children: React.ReactNode
}

export const XcmProvider: React.FC<XcmProviderProps> = ({ children }) => {
  const { account } = useAccount()
  const [transfer, setTransfer] = useState<Transfer | null>(null)

  const form = useXcmForm(transfer)

  const configService = useHydrationConfigService()

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
          a.source.asset === srcAsset &&
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
    const validDestChains = destChainAssetPairs.flatMap((c) => c.chain)
    const validDestAssets = destChainAssetPairs.flatMap((c) => c.assets)

    const isDestChainValid = validDestChains.some(
      (chain) => chain.key === destChain?.key,
    )

    const isDestAssetValid = validDestAssets.some(
      (asset) => asset.key === destAsset?.key,
    )

    if (isDestChainValid && isDestAssetValid) return

    const [firstValidChain] = validDestChains
    const [firstValidAsset] = validDestAssets

    form.setValue("destChain", firstValidChain ?? null)
    form.setValue("destAsset", firstValidAsset ?? null)
  }, [destAsset?.key, destChain?.key, destChainAssetPairs, form])

  useEffect(() => {
    if (destChain) {
      const currentAddress = form.getValues("destAddress")

      if (currentAddress) {
        const isCompatible = isValidAddressOnChain(currentAddress, destChain)

        if (!isCompatible) {
          form.setValue("destAddress", "")
          form.setValue("destAccount", null)
        }
      }
    }
  }, [destChain, form])

  const srcAddress = account?.rawAddress ?? ""
  const srcChainKey = srcChain?.key ?? ""
  const destChainKey = destChain?.key ?? ""

  const { data: xcmTransfer, isLoading: isLoadingTransfer } =
    useXcmTransfer(form)

  useEffect(() => {
    if (xcmTransfer) {
      setTransfer(xcmTransfer)
      if (srcAmount) {
        form.setValue(
          "destAmount",
          getDestinationAmount(srcAmount, xcmTransfer),
        )
      }
    }
  }, [form, srcAmount, xcmTransfer])

  useShallowCompareEffect(() => {
    form.reset(getXcmFormDefaults(account))
  }, [account, form])

  const isLoading = isLoadingTransfer

  useCrossChainBalanceSubscription(srcAddress, srcChainKey)
  useCrossChainBalanceSubscription(destAddress, destChainKey)

  return (
    <XcmContext.Provider
      value={{
        isLoading,
        sourceChainAssetPairs,
        destChainAssetPairs,
        transfer,
        registryChain: chainsMap.get("hydration") as EvmParachain,
      }}
    >
      <FormProvider {...form}>{children}</FormProvider>
    </XcmContext.Provider>
  )
}
