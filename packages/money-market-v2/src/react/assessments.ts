import { useMemo } from "react"
import { Address } from "viem"

import {
  assessBorrow,
  AssessBorrowRequest,
  assessClaim,
  AssessClaimRequest,
  assessCollateral,
  AssessCollateralRequest,
  assessEMode,
  AssessEModeRequest,
  assessRepay,
  AssessRepayRequest,
  assessSupply,
  AssessSupplyRequest,
  assessWithdraw,
  AssessWithdrawRequest,
  BorrowAssessment,
  ClaimAssessment,
  CollateralAssessment,
  EModeAssessment,
  RepayAssessment,
  SummarizeAccountRequest,
  summarizeRewards,
  SupplyAssessment,
  WithdrawAssessment,
} from "@/core"
import { isAsset } from "@/core/assets"
import {
  DerivedResult,
  joinSources,
  useAccountRequest,
  useHollarFacilitator,
  useRewardsRequest,
  useWalletBalances,
} from "@/react/hooks"
import { useMoneyMarket } from "@/react/provider"

/**
 * What an assessment hook takes: the core request less everything the hook
 * reads for itself, plus whose account to assess.
 *
 * Every hook here evaluates the account and its projection on the single tick
 * of {@link useAccountRequest}, and memoizes on the amount rather than keying a
 * query on it — typing into a form re-runs pure math, never a read.
 */
type AssessmentParams<Request, Joined extends keyof Request = never> = Omit<
  Request,
  keyof SummarizeAccountRequest | Joined
> & {
  user: Address | undefined
}

export type SupplyAssessmentParams = AssessmentParams<
  AssessSupplyRequest,
  "walletBalances"
>

/** What supplying `amount` of `asset` would do, bounded by the wallet. */
export const useSupplyAssessment = ({
  user,
  asset,
  amount,
  onBehalfOf,
  spendable,
}: SupplyAssessmentParams): DerivedResult<SupplyAssessment> => {
  const account = useAccountRequest(user)
  const balances = useWalletBalances(user)

  const request = account.data
  const walletBalances = balances.data

  const data = useMemo(
    () =>
      request &&
      walletBalances &&
      assessSupply({
        ...request,
        walletBalances,
        asset,
        amount,
        onBehalfOf,
        spendable,
      }),
    [request, walletBalances, asset, amount, onBehalfOf, spendable],
  )

  return joinSources(data, [account, balances])
}

export type WithdrawAssessmentParams = AssessmentParams<AssessWithdrawRequest>

/** What withdrawing `amount` of `asset` would do. */
export const useWithdrawAssessment = ({
  user,
  asset,
  amount,
  spendable,
}: WithdrawAssessmentParams): DerivedResult<WithdrawAssessment> => {
  const account = useAccountRequest(user)
  const request = account.data

  const data = useMemo(
    () => request && assessWithdraw({ ...request, asset, amount, spendable }),
    [request, asset, amount, spendable],
  )

  return joinSources(data, [account])
}

export type BorrowAssessmentParams = AssessmentParams<
  AssessBorrowRequest,
  "hollarFacilitator"
>

/**
 * What borrowing `amount` of `asset` would do. When `asset` is the market's
 * Hollar token the facilitator bucket is joined in and waited on; for any
 * other asset it is neither passed nor waited on.
 */
export const useBorrowAssessment = ({
  user,
  asset,
  amount,
}: BorrowAssessmentParams): DerivedResult<BorrowAssessment> => {
  const { market } = useMoneyMarket()
  const account = useAccountRequest(user)
  const facilitator = useHollarFacilitator()

  const isHollar = isAsset(asset, market.addresses.HOLLAR_TOKEN)
  const request = account.data
  const hollarFacilitator = facilitator.data

  const data = useMemo(() => {
    if (!request) return undefined
    if (!isHollar) return assessBorrow({ ...request, asset, amount })
    if (!hollarFacilitator) return undefined

    return assessBorrow({ ...request, asset, amount, hollarFacilitator })
  }, [request, isHollar, hollarFacilitator, asset, amount])

  return joinSources(data, isHollar ? [account, facilitator] : [account])
}

export type RepayAssessmentParams = AssessmentParams<
  AssessRepayRequest,
  "walletBalances"
>

/** What repaying `amount` of `asset` from the wallet would do. */
export const useRepayAssessment = ({
  user,
  asset,
  amount,
  spendable,
}: RepayAssessmentParams): DerivedResult<RepayAssessment> => {
  const account = useAccountRequest(user)
  const balances = useWalletBalances(user)

  const request = account.data
  const walletBalances = balances.data

  const data = useMemo(
    () =>
      request &&
      walletBalances &&
      assessRepay({ ...request, walletBalances, asset, amount, spendable }),
    [request, walletBalances, asset, amount, spendable],
  )

  return joinSources(data, [account, balances])
}

export type CollateralAssessmentParams =
  AssessmentParams<AssessCollateralRequest>

/** What flipping `asset`'s collateral flag would do. */
export const useCollateralAssessment = ({
  user,
  asset,
}: CollateralAssessmentParams): DerivedResult<CollateralAssessment> => {
  const account = useAccountRequest(user)
  const request = account.data

  const data = useMemo(
    () => request && assessCollateral({ ...request, asset }),
    [request, asset],
  )

  return joinSources(data, [account])
}

export type EModeAssessmentParams = AssessmentParams<AssessEModeRequest>

/** What switching to e-mode `categoryId` (0 leaves) would do. */
export const useEModeAssessment = ({
  user,
  categoryId,
}: EModeAssessmentParams): DerivedResult<EModeAssessment> => {
  const account = useAccountRequest(user)
  const request = account.data

  const data = useMemo(
    () => request && assessEMode({ ...request, categoryId }),
    [request, categoryId],
  )

  return joinSources(data, [account])
}

export type ClaimAssessmentParams = Omit<AssessClaimRequest, "claimable"> & {
  user: Address | undefined
}

/** What claiming `reward` ("all" or one reward token) would collect. */
export const useClaimAssessment = ({
  user,
  reward,
}: ClaimAssessmentParams): DerivedResult<ClaimAssessment> => {
  const rewards = useRewardsRequest(user)
  const request = rewards.data

  const data = useMemo(
    () =>
      request && assessClaim({ claimable: summarizeRewards(request), reward }),
    [request, reward],
  )

  return joinSources(data, [rewards])
}
