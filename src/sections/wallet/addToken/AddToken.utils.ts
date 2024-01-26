import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRpcProvider } from "providers/rpcProvider"
import { useStore } from "state/store"
import { QUERY_KEYS } from "utils/queryKeys"

export const SELECTABLE_PARACHAINS_IDS = [1000]

export const PARACHAIN_CONFIG: { [x: string]: any } = {
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
  parachainId: number
}

export const useRegisterToken = () => {
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()
  const queryClient = useQueryClient()

  return useMutation(
    async ({
      referralCode,
      accountAddress,
    }: {
      referralCode: string
      accountAddress: string
    }) => {
      return await createTransaction({
        tx: api.tx.referrals.registerCode(referralCode),
      })
    },
    {
      onSuccess: (_, variables) =>
        queryClient.invalidateQueries(
          QUERY_KEYS.referralCodes(variables.accountAddress),
        ),
    },
  )
}
