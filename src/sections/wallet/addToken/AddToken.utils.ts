import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRpcProvider } from "providers/rpcProvider"
import { useStore } from "state/store"
import { HydradxRuntimeXcmAssetLocation } from "@polkadot/types/lookup"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useProviderRpcUrlStore } from "api/provider"
import { TokensConversion } from "sections/pools/modals/AddLiquidity/components/TokensConvertion/TokensConversion"

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

export const useRegisterToken = () => {
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()
  const queryClient = useQueryClient()

  const preference = useProviderRpcUrlStore()
  //QUERY_KEYS.provider(preference.rpcUrl)

  return useMutation(
    async (assetInput: TExternalAssetInput) => {
      return await createTransaction({
        tx: api.tx.assetRegistry.registerExternal(assetInput),
      })
    },
    // {
    //   onSuccess: (_, variables) =>
    //     queryClient.invalidateQueries(
    //       QUERY_KEYS.referralCodes(variables.accountAddress),
    //     ),
    // },
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
