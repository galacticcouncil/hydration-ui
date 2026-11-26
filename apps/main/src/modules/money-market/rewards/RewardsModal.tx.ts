import {
  buildClaimAllRewards,
  buildClaimReward,
} from "@galacticcouncil/money-market/core"
import { useUserIncentives } from "@galacticcouncil/money-market/react"
import { type ClaimableReward } from "@galacticcouncil/money-market/types"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import {
  rewardsDistributorAccountKey,
  useGetRewardsDistributorClaimCall,
} from "@/api/rewardsDistributor"
import { useActionPlanMutation } from "@/modules/money-market/actions/useActionPlanMutation"
import { useUserAddress } from "@/modules/money-market/hooks"
import { useRpcProvider } from "@/providers/rpcProvider"

/** What one claim collects from each of the two payers. */
export type RewardsClaimSelection = {
  /** Every reward token the money market's controller holds, one, or none. */
  controller: "all" | ClaimableReward | undefined
  distributor: boolean
}

/**
 * Claims what the money market's controller and the rewards distributor hold
 * for the account, in one transaction, or only the part `selection` names.
 */
export const useClaimRewards = () => {
  const { t } = useTranslation("borrow")
  const rpc = useRpcProvider()
  const user = useUserAddress()
  const { data: userIncentives } = useUserIncentives(user)
  const getClaimDistributorCall = useGetRewardsDistributorClaimCall()
  const { mutateAsync: submitPlan } = useActionPlanMutation()

  const buildClaimController = (
    controller: RewardsClaimSelection["controller"],
  ) => {
    // left out when it has nothing to pay: its claim would be an empty call
    if (!controller) return []
    if (!user || !userIncentives) throw new Error("User incentives not found")

    return controller === "all"
      ? buildClaimAllRewards({ userIncentives, to: user })
      : buildClaimReward({ reward: controller, userIncentives, to: user })
  }

  return useMutation({
    mutationFn: async (selection: RewardsClaimSelection) => {
      const claimController = buildClaimController(selection.controller)
      const claimDistributor = selection.distributor
        ? await getClaimDistributorCall()
        : undefined

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
