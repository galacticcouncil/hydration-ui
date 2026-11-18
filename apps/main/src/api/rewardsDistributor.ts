import { markets, summarizeReserves } from "@galacticcouncil/money-market/core"
import { useMarketReserves } from "@galacticcouncil/money-market/react"
import { type EvmCall } from "@galacticcouncil/money-market/types"
import {
  getAssetIdFromAddress,
  safeConvertAnyToH160,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { queryOptions, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsInHour, millisecondsInMinute } from "date-fns/constants"
import { useCallback, useMemo } from "react"
import {
  encodeFunctionData,
  erc20Abi,
  type Hex,
  isAddress,
  zeroHash,
} from "viem"

import { AAVE_GAS_LIMIT } from "@/api/aave"
import {
  claimsFileSchema,
  getAccruedRewards,
  getOwedReward,
  getRewardsClaimStatus,
  getRewardsProgramApr,
  getRewardsReadTime,
  getRewardsRetryInterval,
  getRewardsRootsRefetchInterval,
  getRewardsTokenAddress,
  hasRewardsProgramEnded,
  isRewardsLatestStale,
  latestFileSchema,
  type RewardsAccruedStage,
  type RewardsClaimStatus,
  type RewardsIncentive,
  type RewardsLatestFile,
  type RewardsPendingRoot,
} from "@/api/rewardsDistributor.utils"
import { ENV } from "@/config/env"
import { useAssets } from "@/providers/assetsProvider"
import { type TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

const { VITE_REWARDS_DISTRIBUTOR_ADDRESS: ADDRESS } = ENV
// env.ts has checked the shape; any letter case is accepted
const DISTRIBUTOR_ADDRESS = isAddress(ADDRESS, { strict: false })
  ? ADDRESS
  : undefined
const DATA_URL = ENV.VITE_REWARDS_DISTRIBUTOR_URL.replace(/\/+$/, "")
const IS_CONFIGURED = !!DISTRIBUTOR_ADDRESS && !!DATA_URL

// latest.json names each earning asset by symbol only, so the address of the
// reserve's underlying token is mapped here.
const PROGRAM_ASSET_UNDERLYING: Record<string, string> = {
  HUSDC: "0x000000000000000000000000000000010000006e",
  HUSDT: "0x000000000000000000000000000000010000006f",
  HEURC: "0x000000000000000000000000000000010000273c",
}

// Morpho's Universal Rewards Distributor, the calls the app makes.
const DISTRIBUTOR_ABI = [
  {
    type: "function",
    name: "root",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "function",
    name: "pendingRoot",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "root", type: "bytes32" },
      { name: "ipfsHash", type: "bytes32" },
      { name: "validAt", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "timelock",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "claimed",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "reward", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "claim",
    stateMutability: "nonpayable",
    inputs: [
      { name: "account", type: "address" },
      { name: "reward", type: "address" },
      { name: "claimable", type: "uint256" },
      { name: "proof", type: "bytes32[]" },
    ],
    outputs: [{ name: "amount", type: "uint256" }],
  },
] as const

// The chain is picked at run time and the address at build time, so every key
// carries the chain the answer was read from.
const queryKey = ({ genesisHash }: TProviderContext, ...rest: string[]) => [
  "rewardsDistributor",
  genesisHash,
  DISTRIBUTOR_ADDRESS ?? "",
  ...rest,
]

const fetchPublicFile = async (path: string): Promise<unknown> => {
  const res = await fetch(`${DATA_URL}/${path}`)
  // not written yet: no root accepted, or no snapshot taken
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Rewards file ${path}: HTTP ${res.status}`)
  return res.json()
}

/** Whether the distributor exists on the connected chain. */
export const rewardsDistributorDeployedQuery = (rpc: TProviderContext) =>
  queryOptions({
    queryKey: queryKey(rpc, "deployed"),
    enabled: rpc.isReady && IS_CONFIGURED,
    staleTime: Infinity,
    queryFn: async () => {
      if (!DISTRIBUTOR_ADDRESS) return false
      const code = await rpc.evm.getCode({ address: DISTRIBUTOR_ADDRESS })
      return !!code && code !== "0x"
    },
  })

/** The root claims are made against. A newer one may wait out its timelock. */
export const rewardsDistributorRootQuery = (
  rpc: TProviderContext,
  isDeployed: boolean,
) =>
  queryOptions({
    queryKey: queryKey(rpc, "root"),
    enabled: rpc.isReady && isDeployed,
    staleTime: 5 * millisecondsInMinute,
    queryFn: async () => {
      if (!DISTRIBUTOR_ADDRESS) return null
      const root = await rpc.evm.readContract({
        address: DISTRIBUTOR_ADDRESS,
        abi: DISTRIBUTOR_ABI,
        functionName: "root",
      })
      return root === zeroHash ? null : root
    },
  })

/**
 * The root waiting out the timelock and the unix time, in seconds, from which
 * anyone may accept it; null when there is none. The owner can revoke it.
 * Read for a connected account only, with the live root, which it keeps fresh.
 */
export const rewardsDistributorPendingRootQuery = (
  rpc: TProviderContext,
  isDeployed: boolean,
  account: Hex | undefined,
) =>
  queryOptions({
    queryKey: queryKey(rpc, "pendingRoot"),
    enabled: rpc.isReady && isDeployed && !!account,
    staleTime: millisecondsInMinute,
    // from the last read and not the clock, so it is the same on every render
    refetchInterval: ({ state }) =>
      getRewardsRootsRefetchInterval(state.data?.validAt, state.dataUpdatedAt),
    queryFn: async (): Promise<RewardsPendingRoot | null> => {
      if (!DISTRIBUTOR_ADDRESS) return null
      const [root, , validAt] = await rpc.evm.readContract({
        address: DISTRIBUTOR_ADDRESS,
        abi: DISTRIBUTOR_ABI,
        functionName: "pendingRoot",
      })
      // The live root is read after it and put in its own query, which the
      // claim reads too. A root accepted between the two reads is then pending
      // and live at once, which counts once; in the other order it would be
      // neither, and its amount would show as not claimable yet.
      const liveRoot = await rpc.evm.readContract({
        address: DISTRIBUTOR_ADDRESS,
        abi: DISTRIBUTOR_ABI,
        functionName: "root",
      })
      rpc.queryClient.setQueryData(
        rewardsDistributorRootQuery(rpc, isDeployed).queryKey,
        liveRoot === zeroHash ? null : liveRoot,
      )

      if (validAt === 0n) return null
      // a pending zero hash would leave nothing claimable and has no tree
      return { root: root === zeroHash ? null : root, validAt: Number(validAt) }
    },
  })

/**
 * Seconds between a root's submission and the time it may be accepted from.
 * Read for a connected account only.
 */
export const rewardsDistributorTimelockQuery = (
  rpc: TProviderContext,
  isDeployed: boolean,
  account: Hex | undefined,
) =>
  queryOptions({
    queryKey: queryKey(rpc, "timelock"),
    enabled: rpc.isReady && isDeployed && !!account,
    // only the owner changes it
    staleTime: millisecondsInHour,
    queryFn: async () => {
      if (!DISTRIBUTOR_ADDRESS) throw new Error("No rewards distributor")
      const timelock = await rpc.evm.readContract({
        address: DISTRIBUTOR_ADDRESS,
        abi: DISTRIBUTOR_ABI,
        functionName: "timelock",
      })
      return Number(timelock)
    },
  })

/** Every account's cumulative amount and proof under one root. */
export const rewardsDistributorClaimsQuery = (
  rpc: TProviderContext,
  root: Hex | null | undefined,
) =>
  queryOptions({
    queryKey: queryKey(rpc, "claims", root ?? ""),
    enabled: !!root,
    // a root's file never changes; a missing one may still be on its way
    staleTime: ({ state }) => (state.data ? Infinity : millisecondsInMinute),
    queryFn: async () => {
      const json = await fetchPublicFile(`trees/${root}.json`)
      if (json === null) return null

      const file = claimsFileSchema.parse(json)
      if (file.root.toLowerCase() !== root?.toLowerCase()) {
        throw new Error(`Rewards tree ${root} holds root ${file.root}`)
      }
      return file
    },
  })

/** Prefix of every account's claimed amount, to invalidate after a claim. */
export const rewardsDistributorAccountKey = (rpc: TProviderContext) =>
  queryKey(rpc, "account")

/** What the account has claimed, and the balances a claim depends on. */
export const rewardsDistributorAccountQuery = (
  rpc: TProviderContext,
  reward: Hex | undefined,
  account: Hex | undefined,
) =>
  queryOptions({
    queryKey: [
      ...rewardsDistributorAccountKey(rpc),
      account ?? "",
      reward ?? "",
    ],
    enabled: rpc.isReady && !!reward && !!account,
    staleTime: millisecondsInMinute,
    queryFn: async () => {
      if (!DISTRIBUTOR_ADDRESS) throw new Error("No rewards distributor")
      if (!reward || !account) throw new Error("No reward or account")

      const [claimed, accountBalance, distributorBalance] = await Promise.all([
        rpc.evm.readContract({
          address: DISTRIBUTOR_ADDRESS,
          abi: DISTRIBUTOR_ABI,
          functionName: "claimed",
          args: [account, reward],
        }),
        rpc.evm.readContract({
          address: reward,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [account],
        }),
        rpc.evm.readContract({
          address: reward,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [DISTRIBUTOR_ADDRESS],
        }),
      ])

      return { claimed, accountBalance, distributorBalance }
    },
  })

/** Who is earning as of the newest hourly snapshot, and each asset's budget. */
export const rewardsDistributorLatestQuery = (
  rpc: TProviderContext,
  isDeployed: boolean,
) =>
  queryOptions({
    queryKey: queryKey(rpc, "latest"),
    enabled: isDeployed,
    staleTime: 5 * millisecondsInMinute,
    refetchInterval: 5 * millisecondsInMinute,
    queryFn: async () => {
      const json = await fetchPublicFile("latest.json")
      return json === null ? null : latestFileSchema.parse(json)
    },
  })

/** The reward token's price at the money market's oracle, which values the snapshots too. */
export const findRewardPriceUsd = (
  reserves: ReadonlyArray<{ underlyingAsset: string; priceInUsd: string }>,
  reward: string,
) =>
  reserves.find(
    ({ underlyingAsset }) =>
      underlyingAsset.toLowerCase() === reward.toLowerCase(),
  )?.priceInUsd

/**
 * The reward token's price in the main market, whichever market a page has
 * selected: the program runs on that market's reserves only. Summarised once
 * per read, since a price does not accrue between reads.
 */
const useRewardPriceUsd = (reward: string | undefined) => {
  const { data: marketReserves } = useMarketReserves(markets.hydration_v3)

  return useMemo(() => {
    if (!marketReserves || !reward) return undefined

    return findRewardPriceUsd(
      summarizeReserves({
        ...marketReserves,
        currentTimestamp: Math.floor(Date.now() / 1000),
      }),
      reward,
    )
  }, [marketReserves, reward])
}

// lowercase: the claim and snapshot files key their accounts that way
const useRewardsAccountAddress = () => {
  const { account } = useAccount()
  const address = account
    ? safeConvertAnyToH160(account.address).toLowerCase()
    : ""

  return isAddress(address) ? address : undefined
}

export type RewardsDistributorClaim = {
  status: RewardsClaimStatus
  /** The reward token's id in the asset registry, "" when it is not known. */
  assetId: string
  symbol: string
  /** Unclaimed amount in the reward token's own units. */
  owed: string
  /** Its value at the money market's price, "0" when there is none. */
  owedUsd: string
}

type ClaimCall = {
  /** The root the proof was built under. */
  root: Hex
  account: Hex
  reward: Hex
  claimable: bigint
  proof: Hex[]
}

const useRewardsDistributorState = () => {
  const rpc = useRpcProvider()
  const { getAsset } = useAssets()
  const account = useRewardsAccountAddress()

  const { data: isDeployed = false } = useQuery(
    rewardsDistributorDeployedQuery(rpc),
  )
  const { data: root } = useQuery(rewardsDistributorRootQuery(rpc, isDeployed))
  const { data: file } = useQuery(rewardsDistributorClaimsQuery(rpc, root))

  const entry = account ? file?.claims[account] : undefined
  const reward = entry ? file?.reward : undefined

  const { data: state } = useQuery(
    rewardsDistributorAccountQuery(rpc, reward, account),
  )

  const asset = reward ? getAsset(getAssetIdFromAddress(reward)) : undefined

  return useMemo(() => {
    // without the registry entry there are no decimals to show the amount in
    if (!root || !account || !reward || !entry || !state || !asset) {
      return { status: "none" as const, asset, owed: 0n, call: null }
    }

    const claimable = BigInt(entry.claimable)
    const owed = getOwedReward(claimable, state.claimed)
    const status = getRewardsClaimStatus({
      owed,
      accountBalance: state.accountBalance,
      distributorBalance: state.distributorBalance,
      existentialDeposit: BigInt(asset.existentialDeposit),
    })

    const call: ClaimCall = {
      root,
      account,
      reward,
      // the cumulative amount the proof was built for, not what is still owed
      claimable,
      proof: entry.proof,
    }

    return { status, asset, owed, call }
  }, [account, asset, entry, reward, root, state])
}

/** The connected account's unclaimed rewards on the distributor. */
export const useRewardsDistributorClaim = (): RewardsDistributorClaim => {
  const { status, asset, owed, call } = useRewardsDistributorState()
  const rewardPriceUsd = useRewardPriceUsd(call?.reward)

  return useMemo(() => {
    const owedHuman = asset ? scaleHuman(owed, asset.decimals) : "0"

    return {
      status,
      assetId: asset?.id ?? "",
      symbol: asset?.symbol ?? "",
      owed: owedHuman,
      owedUsd: rewardPriceUsd
        ? Big(owedHuman).times(rewardPriceUsd).toString()
        : "0",
    }
  }, [asset, owed, rewardPriceUsd, status])
}

const buildClaimCall = async (
  rpc: TProviderContext,
  { root, account, reward, claimable, proof }: ClaimCall,
): Promise<EvmCall | undefined> => {
  if (!DISTRIBUTOR_ADDRESS) throw new Error("No rewards distributor")

  // A root accepted since the proof was loaded makes the claim revert; the
  // fresh root moves the hooks on to its tree, and the next attempt uses that.
  const currentRoot = await rpc.queryClient.fetchQuery({
    ...rewardsDistributorRootQuery(rpc, true),
    staleTime: 0,
  })
  if (currentRoot !== root) return undefined

  const args = [account, reward, claimable, proof] as const

  return {
    to: DISTRIBUTOR_ADDRESS,
    data: encodeFunctionData({
      abi: DISTRIBUTOR_ABI,
      functionName: "claim",
      args,
    }),
    abi: DISTRIBUTOR_ABI.filter(({ name }) => name === "claim"),
    functionName: "claim",
    args,
    gasLimit: AAVE_GAS_LIMIT,
  }
}

/**
 * Builds the account's claim as a call for a money-market action plan, or
 * nothing when the claim would revert: nothing owed, below the existential
 * deposit, underfunded, or a replaced root.
 */
export const useGetRewardsDistributorClaimCall = () => {
  const rpc = useRpcProvider()
  const { status, call } = useRewardsDistributorState()

  return useCallback(async () => {
    if (status !== "claimable" || !call) return undefined
    return buildClaimCall(rpc, call)
  }, [call, rpc, status])
}

export type RewardsDistributorAccrued = {
  /** The reward token's id in the asset registry, "" when it is not known. */
  assetId: string
  symbol: string
  /** In the order they become claimable; empty when all earned is claimable. */
  stages: {
    stage: RewardsAccruedStage
    /** In the reward token's own units; an estimate while accruing. */
    amount: string
    /** When it should become claimable; absent when unknown or not ahead. */
    claimableAt: Date | undefined
  }[]
}

const NO_ACCRUED: RewardsDistributorAccrued = {
  assetId: "",
  symbol: "",
  stages: [],
}

/**
 * A root's tree as the accrued hook reads it, for a connected account only.
 * One that failed to load or is not served yet is asked for again, which the
 * claim's own read of the same query leaves to the next mount.
 */
export const rewardsDistributorAccruedTreeQuery = (
  rpc: TProviderContext,
  root: Hex | null | undefined,
  account: Hex | undefined,
) =>
  queryOptions({
    ...rewardsDistributorClaimsQuery(rpc, account ? root : undefined),
    refetchInterval: ({ state }) => getRewardsRetryInterval(state),
  })

/** The account's claimed amount as the accrued hook reads it: again after a read that failed. */
export const rewardsDistributorAccruedAccountQuery = (
  rpc: TProviderContext,
  reward: Hex | undefined,
  account: Hex | undefined,
) =>
  queryOptions({
    ...rewardsDistributorAccountQuery(rpc, reward, account),
    refetchInterval: ({ state }) => getRewardsRetryInterval(state),
  })

/**
 * The accrued hook's answer from what it has read. Nothing without the
 * registry's entry for the reward token, as for the claim, whose amount the
 * block would otherwise show as zero above rewards that are owed.
 */
export const getRewardsDistributorAccrued = ({
  account,
  asset,
  ...reads
}: Omit<Parameters<typeof getAccruedRewards>[0], "account"> & {
  account: string | undefined
  asset: { id: string; symbol: string; decimals: number } | undefined
}): RewardsDistributorAccrued => {
  if (!account || !asset) return NO_ACCRUED

  return {
    assetId: asset.id,
    symbol: asset.symbol,
    stages: getAccruedRewards({ account, ...reads }).map(
      ({ stage, amount, claimableAt }) => ({
        stage,
        amount: scaleHuman(amount, asset.decimals),
        claimableAt:
          claimableAt === undefined ? undefined : new Date(claimableAt),
      }),
    ),
  }
}

/** What the connected account has earned on the distributor and cannot claim yet. */
export const useRewardsDistributorAccrued = (): RewardsDistributorAccrued => {
  const rpc = useRpcProvider()
  const { getAsset } = useAssets()
  const account = useRewardsAccountAddress()

  const { data: isDeployed = false } = useQuery(
    rewardsDistributorDeployedQuery(rpc),
  )
  const { data: pending, dataUpdatedAt: pendingReadAt } = useQuery(
    rewardsDistributorPendingRootQuery(rpc, isDeployed, account),
  )
  // the same query as the claim's, so the lines and the amount above them
  // count from one root; the read of the pending root keeps it fresh
  const { data: liveRoot } = useQuery(
    rewardsDistributorRootQuery(rpc, isDeployed),
  )
  const { data: timelock } = useQuery(
    rewardsDistributorTimelockQuery(rpc, isDeployed, account),
  )
  const { data: latest, dataUpdatedAt: latestReadAt } = useQuery(
    rewardsDistributorLatestQuery(rpc, isDeployed),
  )

  // roots that are the same one share a query
  const { data: liveTree } = useQuery(
    rewardsDistributorAccruedTreeQuery(rpc, liveRoot, account),
  )
  const { data: pendingTree } = useQuery(
    rewardsDistributorAccruedTreeQuery(rpc, pending?.root, account),
  )
  const { data: closedTree } = useQuery(
    rewardsDistributorAccruedTreeQuery(rpc, latest?.latestTree?.root, account),
  )

  const reward = getRewardsTokenAddress({ liveTree, pendingTree, latest })
  const { data: state } = useQuery(
    rewardsDistributorAccruedAccountQuery(rpc, reward, account),
  )
  const asset = reward ? getAsset(getAssetIdFromAddress(reward)) : undefined

  // Times are judged as of the newest read instead of a ticking clock, so a
  // line changes when a read does. The pending root is next read 75 seconds
  // after its validAt, so its line can name that time for about a minute
  // after it has passed, and in a hidden tab until the tab is shown again.
  const now = getRewardsReadTime(pendingReadAt, latestReadAt)

  return useMemo(
    () =>
      getRewardsDistributorAccrued({
        account,
        asset,
        claimed: state?.claimed,
        timelock,
        now,
        liveRoot,
        liveTree,
        pending,
        pendingTree,
        latest,
        closedTree,
      }),
    [
      account,
      asset,
      closedTree,
      latest,
      liveRoot,
      liveTree,
      now,
      pending,
      pendingTree,
      state?.claimed,
      timelock,
    ],
  )
}

export type RewardsProgram = {
  /** Why the connected account earns nothing, when it supplies and does not. */
  notEarningReason: string | undefined
  maxHollarDebtUsd: string
  latest: RewardsLatestFile | undefined
}

const NO_PROGRAM: RewardsProgram = {
  notEarningReason: undefined,
  maxHollarDebtUsd: "0",
  latest: undefined,
}

/**
 * The program as the account meets it, from latest.json and the time it was
 * read at, in milliseconds. Nothing once the file is stale or the program has
 * ended: no rate then, and no account is told that it earns nothing.
 *
 * Both are judged at the read and not by a running clock, so the answer is
 * the same on every render between two reads.
 */
export const getRewardsProgram = ({
  latest,
  account,
  readAt,
}: {
  latest: RewardsLatestFile | null | undefined
  /** Lowercase, as the file keys its accounts. */
  account: string | undefined
  readAt: number
}): RewardsProgram => {
  if (
    !latest ||
    isRewardsLatestStale(latest.asOf.hour, readAt) ||
    hasRewardsProgramEnded(latest.program, readAt)
  ) {
    return NO_PROGRAM
  }

  const status = account ? latest.accounts[account] : undefined

  return {
    notEarningReason:
      status?.earning === false ? (status.reason ?? "unknown") : undefined,
    maxHollarDebtUsd: latest.program.maxHollarDebtUsd,
    latest,
  }
}

/**
 * The reward program's newest snapshot, left out once it is stale or the
 * program has ended.
 */
export const useRewardsProgram = (): RewardsProgram => {
  const rpc = useRpcProvider()
  const account = useRewardsAccountAddress()

  const { data: isDeployed = false } = useQuery(
    rewardsDistributorDeployedQuery(rpc),
  )
  const { data: latest, dataUpdatedAt } = useQuery(
    rewardsDistributorLatestQuery(rpc, isDeployed),
  )

  return useMemo(
    () => getRewardsProgram({ latest, account, readAt: dataUpdatedAt }),
    [account, dataUpdatedAt, latest],
  )
}

/**
 * The program's yearly rate per reserve, keyed by the reserve's lowercase
 * underlying address. Empty for an account the program does not pay.
 */
export const getRewardsProgramIncentives = (
  { latest, notEarningReason }: RewardsProgram,
  rewardPriceUsd: string | undefined,
) => {
  const incentives = new Map<string, RewardsIncentive>()
  if (!latest || notEarningReason || !rewardPriceUsd) return incentives

  for (const [name, { budgetPerDay, eligibleUsd }] of Object.entries(
    latest.assets,
  )) {
    const underlying = PROGRAM_ASSET_UNDERLYING[name]
    const apr = getRewardsProgramApr({
      budgetPerDay,
      eligibleUsd,
      rewardDecimals: latest.reward.decimals,
      rewardPriceUsd,
    })

    if (underlying && apr) {
      incentives.set(underlying, {
        incentiveAPR: apr,
        rewardTokenAddress: latest.reward.address,
        rewardTokenSymbol: latest.reward.symbol,
      })
    }
  }

  return incentives
}

/**
 * What the program pays the connected account on each main-market reserve, to
 * add to that reserve's own supply incentives. The reserves of another market
 * are not in it, whatever their addresses: read it for the main market only.
 */
export const useRewardsProgramIncentives = () => {
  const program = useRewardsProgram()
  const rewardPriceUsd = useRewardPriceUsd(program.latest?.reward.address)

  return useMemo(
    () => getRewardsProgramIncentives(program, rewardPriceUsd),
    [program, rewardPriceUsd],
  )
}
