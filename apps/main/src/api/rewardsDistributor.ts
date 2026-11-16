import {
  getAssetIdFromAddress,
  safeConvertAnyToH160,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { queryOptions, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsInMinute } from "date-fns/constants"
import { Binary } from "polkadot-api"
import { useCallback, useMemo } from "react"
import {
  encodeFunctionData,
  erc20Abi,
  type Hex,
  isAddress,
  zeroHash,
} from "viem"

import { AAVE_GAS_LIMIT } from "@/api/aave"
import { estimateGasLimit, useBorrowReserves } from "@/api/borrow/queries"
import {
  claimsFileSchema,
  getOwedReward,
  getRewardsClaimStatus,
  getRewardsProgramApr,
  isRewardsLatestStale,
  latestFileSchema,
  type RewardsClaimStatus,
  type RewardsIncentive,
  type RewardsLatestFile,
} from "@/api/rewardsDistributor.utils"
import { ENV } from "@/config/env"
import { type AnyPapiTx } from "@/modules/transactions/types"
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
  reserves: ReadonlyArray<{ underlyingAsset: string; priceInUSD: string }>,
  reward: string,
) =>
  reserves.find(
    ({ underlyingAsset }) =>
      underlyingAsset.toLowerCase() === reward.toLowerCase(),
  )?.priceInUSD

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
  const { data: borrowReserves } = useBorrowReserves()

  return useMemo(() => {
    const owedHuman = asset ? scaleHuman(owed, asset.decimals) : "0"
    const rewardPriceUsd = call
      ? findRewardPriceUsd(borrowReserves?.formattedReserves ?? [], call.reward)
      : undefined

    return {
      status,
      symbol: asset?.symbol ?? "",
      owed: owedHuman,
      owedUsd: rewardPriceUsd
        ? Big(owedHuman).times(rewardPriceUsd).toString()
        : "0",
    }
  }, [asset, borrowReserves, call, owed, status])
}

const buildClaimTx = async (
  rpc: TProviderContext,
  { root, account, reward, claimable, proof }: ClaimCall,
): Promise<AnyPapiTx | undefined> => {
  const { papi, evm, queryClient } = rpc
  if (!DISTRIBUTOR_ADDRESS) throw new Error("No rewards distributor")

  // A root accepted since the proof was loaded makes the claim revert; the
  // fresh root moves the hooks on to its tree, and the next attempt uses that.
  const currentRoot = await queryClient.fetchQuery({
    ...rewardsDistributorRootQuery(rpc, true),
    staleTime: 0,
  })
  if (currentRoot !== root) return undefined

  const { gasLimit, maxFeePerGas, maxPriorityFeePerGas } =
    await estimateGasLimit({ evm, gasLimit: AAVE_GAS_LIMIT.toString() })

  const call = papi.tx.EVM.call({
    source: account,
    target: DISTRIBUTOR_ADDRESS,
    input: Binary.fromHex(
      encodeFunctionData({
        abi: DISTRIBUTOR_ABI,
        functionName: "claim",
        args: [account, reward, claimable, proof],
      }),
    ),
    value: [0n, 0n, 0n, 0n],
    gas_limit: gasLimit,
    max_fee_per_gas: maxFeePerGas,
    max_priority_fee_per_gas: maxPriorityFeePerGas,
    access_list: [],
    authorization_list: [],
    nonce: undefined,
  })

  // a reverted EVM.call still succeeds as an extrinsic; this one fails with it
  return papi.tx.Dispatcher.dispatch_evm_call({ call: call.decodedCall })
}

/**
 * Builds the account's claim, or nothing when the claim would revert: nothing
 * owed, below the existential deposit, underfunded, or a replaced root.
 */
export const useGetRewardsDistributorClaimTx = () => {
  const rpc = useRpcProvider()
  const { status, call } = useRewardsDistributorState()

  return useCallback(async () => {
    if (status !== "claimable" || !call) return undefined
    return buildClaimTx(rpc, call)
  }, [call, rpc, status])
}

export type RewardsProgram = {
  /** Why the connected account earns nothing, when it supplies and does not. */
  notEarningReason: string | undefined
  maxHollarDebtUsd: string
  latest: RewardsLatestFile | undefined
}

/** The reward program's newest snapshot, left out once it is stale. */
export const useRewardsProgram = (): RewardsProgram => {
  const rpc = useRpcProvider()
  const account = useRewardsAccountAddress()

  const { data: isDeployed = false } = useQuery(
    rewardsDistributorDeployedQuery(rpc),
  )
  const { data: latest, dataUpdatedAt } = useQuery(
    rewardsDistributorLatestQuery(rpc, isDeployed),
  )

  return useMemo(() => {
    if (!latest || isRewardsLatestStale(latest.asOf.hour, dataUpdatedAt)) {
      return {
        notEarningReason: undefined,
        maxHollarDebtUsd: "0",
        latest: undefined,
      }
    }

    const status = account ? latest.accounts[account] : undefined

    return {
      notEarningReason:
        status?.earning === false ? (status.reason ?? "unknown") : undefined,
      maxHollarDebtUsd: latest.program.maxHollarDebtUsd,
      latest,
    }
  }, [account, dataUpdatedAt, latest])
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
