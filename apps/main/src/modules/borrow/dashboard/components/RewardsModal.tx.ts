import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { isNonNullish } from "remeda"

import { useGetClaimAllBorrowRewardsTx } from "@/api/borrow"
import {
  rewardsDistributorAccountKey,
  useGetRewardsDistributorClaimTx,
} from "@/api/rewardsDistributor"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { useRpcProvider } from "@/providers/rpcProvider"

/**
 * Claims what the money market's controller and the rewards distributor hold
 * for the account, in one transaction.
 */
export const useClaimRewards = (isControllerEmpty: boolean) => {
  const { t } = useTranslation("borrow")
  const rpc = useRpcProvider()
  const createBatch = useCreateBatchTx()
  const getClaimControllerTx = useGetClaimAllBorrowRewardsTx()
  const getClaimDistributorTx = useGetRewardsDistributorClaimTx()

  return useMutation({
    mutationFn: async () => {
      // built only when needed: it throws when the controller has nothing for the account
      const claimController = isControllerEmpty
        ? undefined
        : await getClaimControllerTx()
      const claimDistributor = await getClaimDistributorTx()

      const txs = [claimController, claimDistributor].filter(isNonNullish)
      if (!txs.length) throw new Error("No rewards to claim")

      return createBatch({
        txs,
        transaction: {
          toasts: {
            submitted: t("rewards.toasts.submitted"),
            success: t("rewards.toasts.success"),
          },
          invalidateQueries: claimDistributor
            ? [rewardsDistributorAccountKey(rpc)]
            : undefined,
        },
      })
    },
  })
}
