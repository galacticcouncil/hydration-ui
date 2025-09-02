import { AnyChain, Asset } from "@galacticcouncil/xcm-core"
import { create } from "zustand"

export type SelectedAssetAndChain = {
  asset: Asset
  chain: AnyChain
}

type XcmStore = {
  // Search states
  chainSearch: string
  setChainSearch: (search: string) => void

  assetSearch: string
  setAssetSearch: (search: string) => void
}

export const useXcmStore = create<XcmStore>((set) => ({
  // Search states
  chainSearch: "",
  setChainSearch: (search) => set({ chainSearch: search }),

  assetSearch: "",
  setAssetSearch: (search) => set({ assetSearch: search }),
}))
