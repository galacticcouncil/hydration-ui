import {
  HDX_ERC20_ASSET_ID,
  STHDX_ASSET_ID,
} from "@galacticcouncil/money-market/ui-config"
import { useAccount } from "@galacticcouncil/web3-connect"
import { queryOptions, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsInHour, millisecondsInMinute } from "date-fns/constants"

import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { GC_TIME } from "@/utils/consts"

/**
 * Gigapot account — yield reservoir backing the GIGAHDX exchange rate.
 * Derived from `pallet_gigahdx::Config::PalletId = b"gigahdx!"` via
 * `into_account_truncating`. Encoded with the generic Substrate SS58 prefix
 * (42); polkadot-api decodes to raw bytes so the prefix is cosmetic.
 *
 * Exchange-rate numerator (per runtime):
 *   `total_staked_hdx = GigaHdx.TotalLocked + System.Account(<this>).data.free`
 */
export const STAKE_GIGAPOT_ADDRESS =
  "5EYCAe5gvQVxGzukiQoZHF12jtT9iP8tBJSxEkZdRYBZ4jqK"

export const gigaStakeConstantsQuery = (rpc: TProviderContext) =>
  queryOptions({
    queryKey: ["gigaStake", "constants"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const [minStake, cooldownPeriod] = await Promise.all([
        unsafeApi.constants.GigaHdx.MinStake(),
        unsafeApi.constants.GigaHdx.CooldownPeriod(),
      ])

      return {
        minStake,
        cooldownPeriod,
      } as {
        minStake: bigint
        /** blocks number after unstaking */
        cooldownPeriod: number
      }
    },
    staleTime: millisecondsInHour,
    gcTime: GC_TIME,
  })

export const gigaQueryKey = (address: string) => ["gigaStake", address]

export const gigaUnstakePositionsQuery = (
  rpc: TProviderContext,
  address: string,
) =>
  queryOptions({
    queryKey: [...gigaQueryKey(address), "pendingPositions"],
    enabled: !!address && rpc.isApiLoaded,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const entries = await unsafeApi.query.GigaHdx.PendingUnstakes.getEntries(
        address,
        { at: "best" },
      )

      return entries.map(
        ({ keyArgs, value }: { keyArgs: [string, number]; value: bigint }) => ({
          amount: value,
          voteAtBlock: keyArgs[1],
        }),
      ) as Array<{ amount: bigint; voteAtBlock: number }>
    },
  })

export const gigaAccountStakesQuery = (
  rpc: TProviderContext,
  address: string,
) =>
  queryOptions({
    queryKey: [...gigaQueryKey(address), "stakes"],
    enabled: !!address && rpc.isApiLoaded,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const stakes = await unsafeApi.query.GigaHdx.Stakes.getValue(address, {
        at: "best",
      })

      return stakes as {
        hdx: bigint
        gigahdx: bigint
        frozen: bigint
        unstaking: bigint
        unstakingCount: number
      }
    },
  })

export const gigaAccountBalanceQuery = (
  rpc: TProviderContext,
  address: string,
) =>
  queryOptions({
    queryKey: [...gigaQueryKey(address), "balance"],
    enabled: !!address && rpc.isApiLoaded,
    queryFn: async () => {
      const balance = await rpc.sdk.client.balance.getErc20Balance(
        address,
        Number(HDX_ERC20_ASSET_ID),
      )

      return balance
    },
  })

export const useGigaAccountBalance = () => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const address = account?.address ?? ""
  return useQuery(gigaAccountBalanceQuery(rpc, address))
}

export const gigaTotalLockedQuery = (rpc: TProviderContext) =>
  queryOptions({
    queryKey: ["gigaTotalLocked"],
    enabled: rpc.isApiLoaded,
    staleTime: millisecondsInMinute,
    gcTime: millisecondsInMinute,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const totalLocked = await unsafeApi.query.GigaHdx.TotalLocked.getValue({
        at: "best",
      })

      return totalLocked as bigint
    },
  })

export const gigaHDXIssuanceQuery = (rpc: TProviderContext) =>
  queryOptions({
    queryKey: ["totalIssuance", STHDX_ASSET_ID],
    enabled: rpc.isApiLoaded,
    staleTime: millisecondsInMinute,
    gcTime: millisecondsInMinute,
    queryFn: async () => {
      return await rpc.papi.query.Tokens.TotalIssuance.getValue(
        Number(STHDX_ASSET_ID),
        {
          at: "best",
        },
      )
    },
  })

/**
 * Free HDX balance of the gigapot account — second component of the
 * exchange-rate numerator (alongside `GigaHdx.TotalLocked`). Accumulates
 * yield destined for stakers; drained on `realizeYield` / `gigaUnstake`.
 */
export const gigapotBalanceQuery = (rpc: TProviderContext) =>
  queryOptions({
    queryKey: ["gigapotBalance"],
    enabled: rpc.isApiLoaded,
    staleTime: millisecondsInMinute,
    gcTime: millisecondsInMinute,
    queryFn: async () => {
      const account = await rpc.papi.query.System.Account.getValue(
        STAKE_GIGAPOT_ADDRESS,
        { at: "best" },
      )
      return BigInt(account.data.free)
    },
  })

/**
 * GIGAHDX exchange rate (HDX per 1 GIGAHDX), matching the runtime's
 * `pallet_gigahdx::Pallet::exchange_rate()` exactly:
 *
 *   n    = TotalLocked + free_balance(gigapot)
 *   d    = totalIssuance(stHDX)
 *   rate = max(1.0, n / d)
 *
 * Returned as `Big` (decimal) to preserve full precision — callers use
 * `.toString()` to feed into other `Big` ops.
 */
export const useGigaStakeExchangeRate = () => {
  const rpc = useRpcProvider()

  const {
    data: totalIssuance,
    isSuccess: isTotalIssuanceSuccess,
    isLoading: isTotalIssuanceLoading,
  } = useQuery(gigaHDXIssuanceQuery(rpc))
  const {
    data: gigaLockedHDX,
    isSuccess: isGigaLockedHDXSuccess,
    isLoading: isGigaLockedHDXLoading,
  } = useQuery(gigaTotalLockedQuery(rpc))
  const {
    data: gigapotFree,
    isSuccess: isGigapotSuccess,
    isLoading: isGigapotLoading,
  } = useQuery(gigapotBalanceQuery(rpc))

  const allReady =
    isTotalIssuanceSuccess && isGigaLockedHDXSuccess && isGigapotSuccess

  let rate: Big | undefined
  if (allReady) {
    const supply = Big(totalIssuance.toString())
    if (supply.gt(0)) {
      const numerator = Big(gigaLockedHDX.toString()).plus(
        gigapotFree.toString(),
      )
      const raw = numerator.div(supply)
      rate = raw.lt(1) ? Big(1) : raw
    } else {
      rate = Big(1) // bootstrap: no GIGAHDX in circulation
    }
  }

  return {
    isLoading:
      isTotalIssuanceLoading || isGigaLockedHDXLoading || isGigapotLoading,
    data: rate,
  }
}

/**
 * Accumulator pot — holds undistributed fee inflow for voting rewards.
 * Derived from `GigaHdxRewards.RewardPotPalletId = b"gigarwd!"`.
 *
 * Per-track allocation percentages: when a vote is first removed on a
 * completed referendum, `track_pct × accumulator_pot.balance` is moved to
 * the allocated-rewards pot and snapshotted into `ReferendaRewardPool`.
 */
export const REWARD_ACCUMULATOR_POT_ADDRESS =
  "5EYCAe5gvQVxHJoTZGemUumm5Z56Uwvix3eNFz2mHbA8kgft"

// Must mirror `TrackRewardConfig::reward_percentage` in runtime/hydradx/src/gigahdx.rs.
const REWARD_TRACK_PERCENTAGES: Record<number, number> = {
  0: 10, // root
  1: 8, // whitelisted_caller
  5: 5, // treasurer
  9: 5, // economic_parameters
}
const DEFAULT_TRACK_PERCENTAGE = 2

export const getRewardTrackPercentage = (trackId: number): number =>
  REWARD_TRACK_PERCENTAGES[trackId] ?? DEFAULT_TRACK_PERCENTAGE

/**
 * Estimated HDX rewards earmarked for a given referendum.
 *
 *  - If the pool has already been allocated (`ReferendaRewardPool` entry exists),
 *    returns the exact `total_reward`.
 *  - Otherwise estimates as `track_pct × accumulator_pot.free`. Caveat: the
 *    estimate shrinks if another ref allocates first, and grows when the pot
 *    is replenished.
 */
export const gigaRewardPoolEstimateQuery = (
  rpc: TProviderContext,
  refId: number,
  trackId: number,
) =>
  queryOptions({
    queryKey: ["gigaRewardPoolEstimate", refId],
    enabled: rpc.isApiLoaded,
    staleTime: millisecondsInMinute,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const allocated =
        await unsafeApi.query.GigaHdxRewards.ReferendaRewardPool.getValue(refId)
      if (allocated) {
        return {
          amount: BigInt(allocated.total_reward),
          isEstimate: false,
        }
      }

      const account = await rpc.papi.query.System.Account.getValue(
        REWARD_ACCUMULATOR_POT_ADDRESS,
      )
      const potFree = BigInt(account.data.free)
      const pct = getRewardTrackPercentage(trackId)
      return {
        amount: (potFree * BigInt(pct)) / 100n,
        isEstimate: true,
      }
    },
  })

/**
 * Total voting rewards the user can claim *right now* if they triggered
 * the full "claim & compound" batch, plus the metadata needed to build
 * that batch.
 *
 * Components:
 *   pendingHdx      = GigaHdxRewards.PendingRewards[who]
 *                     (already credited — claimable directly via claim_rewards)
 *
 *   allocReadyHdx   = Σ (per-ref share) over every UserVoteRecord[who, ref]
 *                     for completed referenda. Includes Approved/Rejected
 *                     with any conviction — `remove_vote` (the voter calling
 *                     it themselves) always succeeds post-completion. The
 *                     conviction-period lock on the underlying HDX balance
 *                     persists separately in `pallet-balances` and does not
 *                     block `remove_vote` or reward allocation.
 *
 *   allocReadyVotes = list of (refIndex, trackId) for the `remove_vote`
 *                     calls in the batch.
 *
 *   lockedHdx       = Reserved for future use (e.g. shares earned on Ongoing
 *                     refs the user voted on). Currently always 0n —
 *                     Ongoing refs are filtered out earlier in the loop and
 *                     no other case excludes a share.
 *
 * Used by the "Claim rewards" button (`useClaimAndCompound`) which batches:
 *   removeVote × N → realize_yield (optional) → claim_rewards
 */
export const claimableVotingRewardsQuery = (
  rpc: TProviderContext,
  who: string,
) =>
  queryOptions({
    queryKey: [...gigaQueryKey(who), "claimableVotingRewards"],
    enabled: !!who && rpc.isApiLoaded,
    staleTime: millisecondsInMinute,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const pendingRaw =
        await unsafeApi.query.GigaHdxRewards.PendingRewards.getValue(who, {
          at: "best",
        })
      // eslint-disable-next-line no-console
      console.debug("[claimableVotingRewards] PendingRewards raw", {
        who,
        pendingRaw,
        typeofPending: typeof pendingRaw,
      })
      // PendingRewards is `StorageMap<AccountId, Balance, ValueQuery>` — the
      // value should be a bare bigint. Defensively handle the case where the
      // typed binding wraps it (snake_case struct, tuple, etc.) — same
      // pattern that bit us in gigaApr.ts:289.
      const toBig = (v: unknown): bigint => {
        if (v === undefined || v === null) return 0n
        if (typeof v === "bigint") return v
        if (typeof v === "number") return BigInt(v)
        if (typeof v === "string") return BigInt(v)
        if (typeof v === "object") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const o = v as any
          if (typeof o.amount !== "undefined")
            return BigInt(o.amount.toString())
          if (typeof o.value !== "undefined") return BigInt(o.value.toString())
          try {
            return BigInt(o.toString())
          } catch {
            return 0n
          }
        }
        return 0n
      }
      const pendingHdx = toBig(pendingRaw)

      const userVoteEntries: Array<{
        keyArgs: [string, number]
        value: {
          weighted: bigint
          stakedVoteAmount: bigint
          conviction: unknown
        }
      }> = await unsafeApi.query.GigaHdxRewards.UserVoteRecords.getEntries(
        who,
        { at: "best" },
      )

      // Legacy / phantom class locks: ConvictionVoting.ClassLocksFor[user]
      // tracks the aggregate lock per track from ALL the user's past votes
      // (including ones that have been remove_vote'd but never unlocked).
      // Call `ConvictionVoting.unlock(class, target)` to recompute and shrink
      // those locks per class. Idempotent / safe even when nothing's expired.
      //
      // We fetch this here so the consumer can batch unlocks for every class
      // the user has any leftover lock on — not just the ones with current
      // UserVoteRecords.
      const classLocksRaw =
        await rpc.papi.query.ConvictionVoting.ClassLocksFor.getValue(who, {
          at: "best",
        })
      // Shape: Array<[classId, balance]>. Defensive coercion via toBig in case
      // typed binding wraps the balance.
      const legacyLockClasses = new Set<number>()
      if (Array.isArray(classLocksRaw)) {
        for (const entry of classLocksRaw) {
          if (!Array.isArray(entry) || entry.length < 2) continue
          const classId = Number(entry[0])
          const balance = toBig(entry[1])
          if (Number.isFinite(classId) && balance > 0n) {
            legacyLockClasses.add(classId)
          }
        }
      }

      if (userVoteEntries.length === 0) {
        // No active vote records, but the user may still hold legacy class
        // locks worth cleaning up.
        return {
          pendingHdx,
          allocReadyHdx: 0n,
          allocReadyVotes: [],
          unlockClasses: [...legacyLockClasses],
          lockedHdx: 0n,
        }
      }

      const refIds = userVoteEntries.map(({ keyArgs }) => keyArgs[1])

      const [
        refInfos,
        allocPools,
        cachedTracks,
        accumulatorAccount,
        votingForEntries,
      ] = await Promise.all([
        Promise.all(
          refIds.map((id) =>
            rpc.papi.query.Referenda.ReferendumInfoFor.getValue(id, {
              at: "best",
            }),
          ),
        ),
        Promise.all(
          refIds.map((id) =>
            unsafeApi.query.GigaHdxRewards.ReferendaRewardPool.getValue(id, {
              at: "best",
            }),
          ),
        ),
        Promise.all(
          refIds.map((id) =>
            unsafeApi.query.GigaHdxRewards.ReferendumTracks.getValue(id, {
              at: "best",
            }),
          ),
        ),
        rpc.papi.query.System.Account.getValue(REWARD_ACCUMULATOR_POT_ADDRESS, {
          at: "best",
        }),
        // Fallback class lookup. `GigaHdxRewards.ReferendumTracks` is the
        // primary source (cached on first vote) but the runtime deletes it
        // when allocation fires on the first remove_vote. After that, voters
        // still holding `UserVoteRecord` entries for the same ref have no
        // way back to the class via gigahdx-rewards storage.
        //
        // `ConvictionVoting.VotingFor[(who, class)]` still has their vote
        // until they themselves call remove_vote — so we can reverse-map
        // `refIndex → classId` by walking the user's per-class vote entries.
        //
        // Required to avoid `ConvictionVoting.ClassNeeded` errors in the
        // batched claim, because remove_vote(class: undefined) only falls
        // back to `Polls::class_of()` which returns None for completed refs.
        rpc.papi.query.ConvictionVoting.VotingFor.getEntries(who, {
          at: "best",
        }),
      ])

      // Build refIndex → classId map from the user's VotingFor entries.
      const refToClassFromVotingFor = new Map<number, number>()
      for (const voteClass of votingForEntries) {
        if (voteClass.value.type !== "Casting") continue
        const classId = Number(voteClass.keyArgs[1])
        for (const [pollId] of voteClass.value.value.votes) {
          refToClassFromVotingFor.set(Number(pollId), classId)
        }
      }

      const potFree = BigInt(accumulatorAccount.data.free)
      // Refs whose `removeVote` is GUARANTEED to succeed → safe to include
      // in a `utility.batchAll` claim (atomic-on-failure).
      let allocReadyHdx = 0n
      const allocReadyVotes: Array<{
        refIndex: number
        trackId: number | null
      }> = []
      // Refs where the user has an earned share but `removeVote` may revert
      // with `NoPermissionYet` (winning conviction vote whose lock has not
      // expired). We surface the amount as informational — the user will be
      // able to claim it once locks expire (or via Phase 2 lock-aware logic).
      const lockedHdx = 0n

      for (let i = 0; i < userVoteEntries.length; i++) {
        const entry = userVoteEntries[i]
        const refIndex = refIds[i]
        // Loop bounds guarantee these exist; satisfy noUncheckedIndexedAccess.
        if (entry === undefined || refIndex === undefined) continue
        const record = entry.value
        const refInfo = refInfos[i] as { type?: string } | null
        const allocated = allocPools[i] as {
          totalReward: bigint
          totalWeightedVotes: bigint
        } | null
        const cachedTrack = cachedTracks[i] as number | null | undefined

        // Skip refs that don't exist (shouldn't happen) or are still ongoing
        // (removing an active vote would interrupt the user's choice).
        if (!refInfo) continue
        if (refInfo.type === "Ongoing") continue

        // Three-tier track resolution:
        //   1. GigaHdxRewards.ReferendumTracks cache (primary — populated
        //      on first vote, deleted when allocation fires)
        //   2. ConvictionVoting.VotingFor reverse-map (secondary — still
        //      has the vote until the user calls remove_vote themselves)
        //   3. null (only when both above fail — `remove_vote` would then
        //      revert with `ClassNeeded`; we still include in the batch so
        //      the user sees the diagnostic and we don't silently drop refs)
        const trackId: number | null =
          cachedTrack !== null && cachedTrack !== undefined
            ? Number(cachedTrack)
            : (refToClassFromVotingFor.get(refIndex) ?? null)

        // Defensive field reader — `unsafeApi` decodes runtime structs with
        // snake_case field names (matching the Rust definitions), not the
        // camelCase we'd expect from typed bindings. We probe both shapes.
        const readField = (obj: unknown, ...names: string[]): unknown => {
          if (obj === null || obj === undefined || typeof obj !== "object")
            return undefined
          for (const n of names) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const v = (obj as any)[n]
            if (v !== undefined) return v
          }
          return undefined
        }

        let share = 0n
        const weighted = toBig(readField(record, "weighted"))

        if (allocated) {
          // Exact: allocation snapshot already exists.
          const totalReward = toBig(
            readField(allocated, "totalReward", "total_reward"),
          )
          const totalWeighted = toBig(
            readField(allocated, "totalWeightedVotes", "total_weighted_votes"),
          )
          if (totalWeighted > 0n) {
            share = (weighted * totalReward) / totalWeighted
          }
        } else if (trackId !== null) {
          // Estimate: allocation will fire on next remove_vote.
          // share = weighted × (track_pct × pot) / live_total_weighted
          const pct = getRewardTrackPercentage(trackId)
          const allocation = (potFree * BigInt(pct)) / 100n
          const liveTally =
            await unsafeApi.query.GigaHdxRewards.ReferendaTotalWeightedVotes.getValue(
              refIndex,
              { at: "best" },
            )
          if (liveTally) {
            const totalWeighted = toBig(
              readField(liveTally, "totalWeighted", "total_weighted"),
            )
            if (totalWeighted > 0n) {
              share = (weighted * allocation) / totalWeighted
            }
          }
        }

        // `remove_vote` (called by the voter themselves) succeeds for ANY
        // completed referendum, regardless of conviction:
        //   - The vote storage entry is removed unconditionally
        //   - The reward allocation hook fires and credits PendingRewards
        //   - The conviction lock on the user's HDX balance (in
        //     `pallet-balances`) persists until its lock period elapses
        //     naturally — but it does NOT block `remove_vote` itself
        //
        // The `NoPermissionYet` error I previously gated against is from
        // `remove_other_vote` (a 3rd party trying to clean up someone else's
        // vote pre-lock-expiry), not `remove_vote`. So the only refs we must
        // exclude from a batch are still-Ongoing ones — removing those would
        // pull the user's active vote.
        //
        // Validated on lark with ref 342 (Approved + Aye + Locked1x), where
        // `remove_vote` succeeded ~1.8 hours post-approval while the 7-day
        // lock was still active. The reward (2,000 HDX) landed in
        // PendingRewards as expected.
        //
        // The Ongoing case is already filtered above (`if (refInfo.type ===
        // "Ongoing") continue`), so here we treat everything else as safe.
        allocReadyHdx += share
        allocReadyVotes.push({ refIndex, trackId })
        if (trackId !== null) legacyLockClasses.add(trackId)
      }

      return {
        pendingHdx,
        allocReadyHdx,
        allocReadyVotes,
        unlockClasses: [...legacyLockClasses],
        lockedHdx,
      }
    },
  })
