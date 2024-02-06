import { useMutation } from "@tanstack/react-query"
import { useRpcProvider } from "providers/rpcProvider"
import { useStore } from "state/store"
import { HydradxRuntimeXcmAssetLocation } from "@polkadot/types/lookup"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export const SELECTABLE_PARACHAINS_IDS = ["1000"]

export const PARACHAIN_CONFIG: {
  [x: string]: {
    palletInstance: string
    network: string
    parents: string
    interior: HydradxRuntimeXcmAssetLocation["interior"]["type"]
  }
} = {
  "1000": {
    palletInstance: "50",
    network: "polkadot",
    parents: "1",
    interior: "X3",
  },
}

export type TExternalAsset = {
  id: string
  decimals: number
  symbol: string
  name: string
  parachainId: string
}

export type TExternalAssetInput = {
  parents: string
  interior: {
    X3: [
      {
        Parachain: string
      },
      { PalletInstance: string },
      {
        GeneralIndex: string
      },
    ]
  }
}

export const useRegisterToken = ({ onSuccess }: { onSuccess: () => void }) => {
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()

  return useMutation(
    async (assetInput: TExternalAssetInput) => {
      return await createTransaction({
        tx: api.tx.assetRegistry.registerExternal(assetInput),
      })
    },
    {
      onSuccess,
    },
  )
}

export const useUserExternalTokenStore = create<{
  tokens: TExternalAsset[]
  addToken: (TokensConversion: TExternalAsset) => void
  isAdded: (id: string | undefined) => boolean
}>()(
  persist(
    (set, get) => ({
      tokens: [],
      addToken: (token) =>
        set((store) => ({ tokens: [...store.tokens, token] })),
      isAdded: (id) =>
        id ? get().tokens.some((token) => token.id === id) : false,
    }),
    {
      name: "external-tokens",
    },
  ),
)
