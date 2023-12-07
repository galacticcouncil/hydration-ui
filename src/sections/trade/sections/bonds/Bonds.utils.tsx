import ClockIcon from "assets/icons/ClockIcon.svg?react"
import Percentage from "assets/icons/Percentage.svg?react"
import Cake from "assets/icons/Cake.svg?react"
import { ReactNode } from "react"
import { useStore } from "state/store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

const steps = ["first", "second", "third"] as const

export const whyBonds: Array<{
  index: (typeof steps)[number]
  icon: ReactNode
}> = [
  {
    index: "first",
    icon: <Percentage sx={{ color: "vibrantBlue200" }} />,
  },
  {
    index: "second",
    icon: <ClockIcon sx={{ color: "brightBlue300" }} />,
  },
  {
    index: "third",
    icon: <Cake sx={{ color: "green700" }} />,
  },
]

export const useClaimBond = () => {
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()
  const queryClient = useQueryClient()
  const { account } = useAccount()

  return useMutation(
    async ({ bondId, amount }: { bondId: string; amount: string }) => {
      return await createTransaction(
        { tx: api.tx.bonds.redeem(bondId, amount) },
        { toast: {} },
      )
    },
    {
      onSuccess: (_, variables) =>
        queryClient.invalidateQueries(
          QUERY_KEYS.tokenBalanceLive(variables.bondId, account?.address),
        ),
    },
  )
}
