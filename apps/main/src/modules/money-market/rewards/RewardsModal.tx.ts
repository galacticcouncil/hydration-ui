import { buildClaimAllRewards } from "@galacticcouncil/money-market/core"
import { useUserIncentives } from "@galacticcouncil/money-market/react"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import {
  rewardsDistributorAccountKey,
  useGetRewardsDistributorClaimCall,
} from "@/api/rewardsDistributor"
import { useActionPlanMutation } from "@/modules/money-market/actions/useActionPlanMutation"
import { useUserAddress } from "@/modules/money-market/hooks"
import { useRpcProvider } from "@/providers/rpcProvider"

/**
 * Claims what the money market's controller and the rewards distributor hold
 * for the account, in one transaction.
 */
export const useClaimRewards = (isControllerEmpty: boolean) => {
  const { t } = useTranslation("borrow")
  const rpc = useRpcProvider()
  const user = useUserAddress()
  const { data: userIncentives } = useUserIncentives(user)
  const getClaimDistributorCall = useGetRewardsDistributorClaimCall()
  const { mutateAsync: submitPlan } = useActionPlanMutation()

  const buildClaimController = () => {
    if (!user || !userIncentives) throw new Error("User incentives not found")
    return buildClaimAllRewards({ userIncentives, to: user })
  }

  return useMutation({
    mutationFn: async () => {
      // left out when it has nothing to pay: its claim would be an empty call
      const claimController = isControllerEmpty ? [] : buildClaimController()
      const claimDistributor = await getClaimDistributorCall()

      const plan = [
        ...claimController,
        ...(claimDistributor ? [claimDistributor] : []),
      ]
      if (!plan.length) throw new Error("No rewards to claim")

      return submitPlan({
        plan,
        toasts: {
          submitted: t("rewards.toasts.submitted"),
          success: t("rewards.toasts.success"),
        },
        invalidateQueries: claimDistributor
          ? [rewardsDistributorAccountKey(rpc)]
          : undefined,
      })
    },
  })
}
