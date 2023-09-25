import { ReactComponent as ClockIcon } from "assets/icons/ClockIcon.svg"
import { ReactComponent as Percentage } from "assets/icons/Percentage.svg"
import { ReactComponent as Cake } from "assets/icons/Cake.svg"
import { ReactNode } from "react"
import { format } from "date-fns"
import { useAccountStore, useStore } from "state/store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useRpcProvider } from "providers/rpcProvider"

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

export const getBondName = (symbol: string, date: Date, long?: boolean) =>
  `${symbol.toLocaleUpperCase()}${long ? " Bond" : "b"} ${format(
    date,
    "dd/MM/yyyy",
  )}`

export const useClaimBond = () => {
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()
  const queryClient = useQueryClient()
  const { account } = useAccountStore()

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
