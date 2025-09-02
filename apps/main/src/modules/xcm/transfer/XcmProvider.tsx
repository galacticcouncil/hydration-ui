import { isValidAddressOnChain } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { EvmParachain } from "@galacticcouncil/xcm-core"
import { Transfer } from "@galacticcouncil/xcm-sdk"
import Big from "big.js"
import { useEffect, useMemo } from "react"
import { FormProvider } from "react-hook-form"

import { useCrossChainBalanceSubscription } from "@/api/xcm"
import { ChainAssetPair } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelect"
import { useXcmForm } from "@/modules/xcm/transfer/hooks/useXcmForm"
import { XcmContext } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { useXcmTransfer } from "@/modules/xcm/transfer/hooks/useXcmTransfer"
import {
  getValidDestinationAssets,
  getValidDestinationChains,
  XCM_CHAINS,
} from "@/modules/xcm/transfer/utils/chain"

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
  const form = useXcmForm()

  const [srcChain, srcAsset, destChain, destAsset, srcAmount] = form.watch([
    "srcChain",
    "srcAsset",
    "destChain",
    "destAsset",
    "srcAmount",
  ])

  const sourceChainAssetPairs = useMemo((): ChainAssetPair[] => {
    return XCM_CHAINS.map((chain) => {
      const chainAssets = chain.assetsData
      const assets = chainAssets
        ? [...chainAssets.values()].map(
            (chainAssetData) => chainAssetData.asset,
          )
        : []
      return { chain, assets }
    })
  }, [])

  const destChainAssetPairs = useMemo((): ChainAssetPair[] => {
    if (!srcAsset || !srcChain) {
      return []
    }

    const validChains = getValidDestinationChains(srcChain, srcAsset)

    return validChains.map((chain) => {
      const assets = getValidDestinationAssets(srcAsset, chain)
      return { chain, assets }
    })
  }, [srcAsset, srcChain])

  // Set first valid destination chain and asset when source selection changes
  useEffect(() => {
    if (srcAsset && srcChain) {
      // Check if current destination chain is still valid for the source asset
      const validDestChains = getValidDestinationChains(srcChain, srcAsset)
      const isDestChainValid = validDestChains.some(
        (chain) => chain.key === destChain?.key,
      )

      // Check if current destination asset is still valid for the destination chain
      const validDestAssets = destChain
        ? getValidDestinationAssets(srcAsset, destChain)
        : []
      const isDestAssetValid = validDestAssets.some(
        (asset) => asset.key === destAsset?.key,
      )

      // If either chain or asset is invalid, set the first valid chain and its first asset
      if (!isDestChainValid || !isDestAssetValid) {
        if (validDestChains.length > 0) {
          const firstValidChain = validDestChains[0]
          if (firstValidChain) {
            const firstValidAssets = getValidDestinationAssets(
              srcAsset,
              firstValidChain,
            )

            if (firstValidAssets.length > 0 && firstValidAssets[0]) {
              form.setValue("destChain", firstValidChain)
              form.setValue("destAsset", firstValidAssets[0])
            }
          }
        }
      }
    }
  }, [srcAsset, srcChain, destChain, destAsset, form])

  // Reset destination address and account when destination chain changes to incompatible chain
  useEffect(() => {
    if (destChain) {
      const currentAddress = form.getValues("destAddress")

      // If we have a destination chain and current address/account, check compatibility
      if (currentAddress) {
        const isCompatible = isValidAddressOnChain(currentAddress, destChain)

        if (!isCompatible) {
          // Reset to empty values if incompatible
          form.setValue("destAddress", "")
          form.setValue("destAccount", null)
        }
      }
    }
  }, [destChain, form])

  const address = account?.address ?? ""
  const srcChainKey = srcChain?.key ?? ""
  const destChainKey = destChain?.key ?? ""

  useCrossChainBalanceSubscription(address, srcChainKey)
  useCrossChainBalanceSubscription(address, destChainKey)

  const { data: transfer, isLoading: isLoadingTransfer } = useXcmTransfer(form)

  useEffect(() => {
    if (transfer && srcAmount) {
      form.setValue("destAmount", getDestinationAmount(srcAmount, transfer))
    }
  }, [form, srcAmount, transfer])

  const isLoading = isLoadingTransfer

  return (
    <XcmContext.Provider
      value={{
        isLoading,
        sourceChainAssetPairs,
        destChainAssetPairs,
        transfer: transfer ?? null,
        registryChain: chainsMap.get("hydration") as EvmParachain,
      }}
    >
      <FormProvider {...form}>{children}</FormProvider>
    </XcmContext.Provider>
  )
}
