import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ChainMetadata } from "sections/wallet/upgrade/WalletUpgradeModal.utils"
import { Hash } from "@polkadot/types/interfaces"

export const useCacheApiMetadataStore = create(
  persist<{
    metadata: Record<string, ChainMetadata>
    checkMetadata: (
      genesisHash: Hash,
      extensionName: string,
      current: ChainMetadata,
    ) => boolean
    setMetadata: (
      genesisHash: Hash,
      extensionName: string,
      metadata: ChainMetadata,
    ) => void
  }>(
    (set, get) => {
      const hash = (genesisHash: Hash, extensionName: string) =>
        [genesisHash.toHex(), extensionName].join(",")

      function setMetadata(
        genesisHash: Hash,
        extensionName: string,
        metadata: ChainMetadata,
      ) {
        set((state) => ({
          ...state,
          metadata: {
            ...state.metadata,
            [hash(genesisHash, extensionName)]: metadata,
          },
        }))
      }

      function checkMetadata(
        genesisHash: Hash,
        extensionName: string,
        current: ChainMetadata,
      ) {
        const previous = get().metadata[hash(genesisHash, extensionName)]
        if (previous == null) {
          setMetadata(genesisHash, extensionName, current)
          return true
        }

        return (
          previous.icon === current.icon &&
          previous.ss58Format === current.ss58Format &&
          previous.tokenDecimals === current.tokenDecimals &&
          previous.tokenSymbol === current.tokenSymbol
        )
      }

      return {
        metadata: {},
        setMetadata,
        checkMetadata,
      }
    },
    { name: "metadata" },
  ),
)
