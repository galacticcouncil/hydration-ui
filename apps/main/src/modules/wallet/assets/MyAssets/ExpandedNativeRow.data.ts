import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { TokenLockType, useNativeTokenLocks } from "@/api/balances"
import { bestNumberQuery } from "@/api/chain"
import { openGovUnlockedTokensQuery } from "@/api/democracy"
import {
  gigaStakeConstantsQuery,
  gigaUnstakePositionsQuery,
} from "@/api/gigaStake"
import { useProxyUrl } from "@/api/provider"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAssetPrice } from "@/states/displayAsset"
import { PARACHAIN_BLOCK_TIME } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"

export const useNativeAssetLocks = () => {
  const { native } = useAssets()

  const { data: locks, isLoading } = useNativeTokenLocks()
  const { price } = useAssetPrice(native.id)

  const lockedInGigaStaking = scaleHuman(
    locks?.get(TokenLockType.GigaStaking) ?? "0",
    native.decimals,
  )
  const lockedInVesting = scaleHuman(
    locks?.get(TokenLockType.Vesting) ?? "0",
    native.decimals,
  )
  const lockedInDemocracy = scaleHuman(
    locks?.get(TokenLockType.Democracy) ?? "0",
    native.decimals,
  )
  const lockedInOpenGov = scaleHuman(
    locks?.get(TokenLockType.OpenGov) ?? "0",
    native.decimals,
  )
  const lockedInStaking = scaleHuman(
    locks?.get(TokenLockType.Staking) ?? "0",
    native.decimals,
  )

  const lockedInGigaStakingDisplay = Big(lockedInGigaStaking)
    .times(price)
    .toString()
  const lockedInVestingDisplay = Big(lockedInVesting).times(price).toString()
  const lockedInDemocracyDisplay = Big(lockedInDemocracy)
    .times(price)
    .toString()
  const lockedInOpenGovDisplay = Big(lockedInOpenGov).times(price).toString()
  const lockedInStakingDisplay = Big(lockedInStaking).times(price).toString()

  return {
    lockedInGigaStaking,
    lockedInGigaStakingDisplay,
    lockedInVesting,
    lockedInVestingDisplay,
    lockedInDemocracy,
    lockedInDemocracyDisplay,
    lockedInOpenGov,
    lockedInOpenGovDisplay,
    lockedInStaking,
    lockedInStakingDisplay,
    isLoading,
  }
}

export const useUnlockableNativeTokens = (lockedInReferenda: string) => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const { native } = useAssets()
  const indexerUrl = useProxyUrl()

  const { data: bestNumber } = useQuery(bestNumberQuery(rpc))
  const { data: gigaStakeConstants, isLoading: gigaStakeConstantsLoading } =
    useQuery(gigaStakeConstantsQuery(rpc))

  const cooldownPeriod = gigaStakeConstants?.cooldownPeriod ?? 0
  const parachainBlockNumber = bestNumber?.parachainBlockNumber ?? 0

  const { data: unlockedTokens, isLoading: unlockedTokensLoading } = useQuery(
    openGovUnlockedTokensQuery(rpc, account?.address ?? "", indexerUrl),
  )

  const { data: pendingPositions = [], isLoading: pendingPositionsLoading } =
    useQuery(gigaUnstakePositionsQuery(rpc, account?.address ?? ""))

  const lockedInReferendaBig = new Big(lockedInReferenda)

  const maxLocked = scaleHuman(
    unlockedTokens?.maxLockedValue ?? "0",
    native.decimals,
  )

  const unlockableReferendaLocks = lockedInReferendaBig.lte(0)
    ? "0"
    : lockedInReferendaBig.minus(maxLocked).toString()

  const unlockableGigaPendingPositions = pendingPositions.filter(
    (position) => position.voteAtBlock + cooldownPeriod < parachainBlockNumber,
  )

  const unlockableGigaStakingLocks = unlockableGigaPendingPositions
    .reduce((acc, position) => acc + position.amount, 0n)
    .toString()

  const lockedReferendaSeconds =
    (unlockedTokens?.maxLockedBlock ?? 0) * PARACHAIN_BLOCK_TIME

  const maxUnlockable = Big.min(
    unlockableReferendaLocks,
    unlockableGigaStakingLocks,
  ).toString()

  const [displayMaxUnlockable] = useDisplayAssetPrice(native.id, maxUnlockable)

  return {
    maxUnlockable,
    displayMaxUnlockable,
    lockedReferendaSeconds: lockedReferendaSeconds,
    unlockableGigaPendingPositions,
    votesToRemove: unlockedTokens?.votesToRemove ?? [],
    classIds: unlockedTokens?.classIds ?? [],
    isLoading:
      unlockedTokensLoading ||
      pendingPositionsLoading ||
      gigaStakeConstantsLoading,
  }
}
