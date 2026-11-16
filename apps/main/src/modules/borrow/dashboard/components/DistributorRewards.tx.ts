import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { prop } from "remeda"

import {
  rewardsDistributorAccountKey,
  useGetRewardsDistributorClaimTx,
} from "@/api/rewardsDistributor"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

export const useClaimDistributorRewards = (symbol: string) => {
  const { t } = useTranslation("borrow")
  const rpc = useRpcProvider()
  const createTransaction = useTransactionsStore(prop("createTransaction"))
  const getClaimTx = useGetRewardsDistributorClaimTx()

  return useMutation({
    mutationFn: async () => {
      const tx = await getClaimTx()
      if (!tx) throw new Error("Nothing to claim under the current root")

      return createTransaction({
        tx,
        toasts: {
          submitted: t("distributorRewards.claim.toasts.submitted", { symbol }),
          success: t("distributorRewards.claim.toasts.success", { symbol }),
        },
        invalidateQueries: [rewardsDistributorAccountKey(rpc)],
      })
    },
  })
}
