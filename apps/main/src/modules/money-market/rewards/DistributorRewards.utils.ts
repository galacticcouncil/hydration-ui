import {
  type RewardsDistributorAccrued,
  type RewardsDistributorClaim,
} from "@/api/rewardsDistributor"

/**
 * Whether the block has anything to show: an amount under the live root, or
 * lines for what is not claimable yet, which is all an account has in its
 * first epoch.
 */
export const hasDistributorRewards = (
  claim: RewardsDistributorClaim,
  accrued: RewardsDistributorAccrued,
) => claim.status !== "none" || accrued.stages.length > 0

/** The reward token's symbol; a claim with nothing under the live root has none. */
export const getDistributorRewardsSymbol = (
  claim: RewardsDistributorClaim,
  accrued: RewardsDistributorAccrued,
) => claim.symbol || accrued.symbol

/** The reward token's registry id, for its logo; taken as the symbol is. */
export const getDistributorRewardsAssetId = (
  claim: RewardsDistributorClaim,
  accrued: RewardsDistributorAccrued,
) => claim.assetId || accrued.assetId
