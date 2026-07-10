import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"

import { TokenLockType, useNativeTokenLocks } from "@/api/balances"
import { bestNumberQuery } from "@/api/chain"
import {
  accountUnlockClassesQuery,
  openGovUnlockedTokensQuery,
  TUnlockableVote,
} from "@/api/democracy"
import {
  gigaStakeConstantsQuery,
  gigaUnstakePositionsQuery,
} from "@/api/gigaStake"
import { useProxyUrl } from "@/api/provider"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { PARACHAIN_BLOCK_TIME } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"

export const useUnlockableNativeTokens = () => {
  const { account } = useAccount()
  const rpc = useRpcProvider()
  const { native } = useAssets()
  const indexerUrl = useProxyUrl()
  const address = account?.address ?? ""
  const { data: locks } = useNativeTokenLocks()

  const referendaLock = locks?.get(TokenLockType.OpenGov) ?? 0n
  const gigaLock = locks?.get(TokenLockType.GigaStaking) ?? 0n

  const { data, isLoading } = useQuery({
    enabled: rpc.isApiLoaded && !!address,
    queryKey: [
      "unlockable-native-tokens",
      address,
      referendaLock.toString(),
      gigaLock.toString(),
    ],
    queryFn: async () => {
      let referendaUnlockable = 0n
      let votesToRemove: TUnlockableVote[] = []
      let lockedReferendaSeconds = 0
      let classIds: number[] = []

      if (referendaLock > 0n) {
        const unlockedTokens = await rpc.queryClient.ensureQueryData(
          openGovUnlockedTokensQuery(rpc, address, indexerUrl),
        )

        const stillLockedByVotes = BigInt(unlockedTokens.maxLockedValue)

        referendaUnlockable =
          referendaLock > stillLockedByVotes
            ? referendaLock - stillLockedByVotes
            : 0n

        votesToRemove = unlockedTokens.votesToRemove
        lockedReferendaSeconds =
          (unlockedTokens.maxLockedBlock ?? 0) * PARACHAIN_BLOCK_TIME

        classIds = await rpc.queryClient.ensureQueryData(
          accountUnlockClassesQuery(rpc, address),
        )
      }

      let gigaUnlockable = 0n
      let unlockableGigaPendingPositions: Array<{
        voteAtBlock: number
        amount: bigint
      }> = []

      if (gigaLock > 0n) {
        const [pendingPositions, bestNumber, gigaStakeConstants] =
          await Promise.all([
            rpc.queryClient.ensureQueryData(
              gigaUnstakePositionsQuery(rpc, address),
            ),
            rpc.queryClient.ensureQueryData(bestNumberQuery(rpc)),
            rpc.queryClient.ensureQueryData(gigaStakeConstantsQuery(rpc)),
          ])

        unlockableGigaPendingPositions = pendingPositions.filter(
          (position) =>
            position.voteAtBlock + gigaStakeConstants.cooldownPeriod <
            bestNumber.parachainBlockNumber,
        )

        gigaUnlockable = unlockableGigaPendingPositions.reduce(
          (acc, position) => acc + position.amount,
          0n,
        )
      }

      const effectiveLockBefore =
        referendaLock > gigaLock ? referendaLock : gigaLock
      const referendaLockAfter = referendaLock - referendaUnlockable
      const gigaLockAfter = gigaLock - gigaUnlockable
      const effectiveLockAfter =
        referendaLockAfter > gigaLockAfter ? referendaLockAfter : gigaLockAfter
      const maxUnlockable = effectiveLockBefore - effectiveLockAfter

      return {
        maxUnlockable: scaleHuman(maxUnlockable.toString(), native.decimals),
        lockedReferendaSeconds,
        unlockableGigaPendingPositions,
        votesToRemove,
        classIds,
      }
    },
  })

  const [displayMaxUnlockable] = useDisplayAssetPrice(
    native.id,
    data?.maxUnlockable ?? "0",
  )

  return {
    maxUnlockable: data?.maxUnlockable ?? "0",
    displayMaxUnlockable,
    lockedReferendaSeconds: data?.lockedReferendaSeconds ?? 0,
    unlockableGigaPendingPositions: data?.unlockableGigaPendingPositions ?? [],
    votesToRemove: data?.votesToRemove ?? [],
    classIds: data?.classIds ?? [],
    isLoading,
  }
}
