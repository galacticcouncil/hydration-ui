/**
 * Vault Snapshot: what a Gamma vault is, and what it and its pool hold now.
 *
 * - Identity tier (`vaultIdentityQuery`): the vault's hypervisor, its stack,
 *   share symbol and owner. Never changes, read once per session.
 * - Live tier (`useVaultSnapshots`): vault totals, positions, band and the
 *   pool's slot0 / reserves, read in ONE round so status, price and TVL all
 *   describe the same moment.
 * - Deposit checks (`useVaultDepositChecks`): TWAP guard and caps. Only a
 *   deposit needs them, so only the deposit form reads them, fresh.
 *
 * Query keys are private to this module: after a vault tx, pass
 * `vaultTxInvalidation(pool)` to the transaction.
 */
import { safeConvertAnyToH160 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import {
  QueryClient,
  queryOptions,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { erc20Abi, Hex, PublicClient, zeroAddress } from "viem"

import {
  CLEARING_ABI,
  FACTORY_ABI,
  HYPERVISOR_ABI,
  POOL_ABI,
  REBALANCE_PROXY_ABI,
  UNIPROXY_CLEARANCE_ABI,
} from "@/api/gamma/abi"
import { GAMMA_STACKS, GammaStack } from "@/api/gamma/config"
import { v3LpFeeShare, V3PoolBase } from "@/api/pools"
import { useRpcProvider } from "@/providers/rpcProvider"

const VAULT_GAS_FALLBACK = 1_000_000n

export const estimateVaultCallGas = (
  evm: PublicClient,
  from: Hex,
  { to, data }: { to: Hex; data: Hex },
) =>
  evm
    .estimateGas({ account: from, to, data })
    .then((gas) => (gas * 120n) / 100n)
    .catch(() => VAULT_GAS_FALLBACK)

type HypervisorFn = Extract<
  (typeof HYPERVISOR_ABI)[number],
  { type: "function" }
>["name"]

const readHypervisor = <T>(
  evm: PublicClient,
  address: `0x${string}`,
  functionName: HypervisorFn,
) =>
  evm.readContract({
    abi: HYPERVISOR_ABI,
    address,
    functionName,
  }) as Promise<T>

export type VaultIdentity = {
  hypervisor: `0x${string}`
  stack: GammaStack
  shareSymbol: string
  owner: `0x${string}`
}

export type VaultState = {
  address: `0x${string}`
  uniProxy: `0x${string}`
  token0: `0x${string}`
  token1: `0x${string}`
  totalSupply: bigint
  total0: bigint
  total1: bigint
  baseLower: number
  baseUpper: number
  limitLower: number
  limitUpper: number
  shareSymbol: string
  /** Deposit whitelist; open when this is the UniProxy. */
  whitelisted: `0x${string}`
  base: { liquidity: bigint; amount0: bigint; amount1: bigint }
  limit: { liquidity: bigint; amount0: bigint; amount1: bigint }
  idle: { amount0: bigint; amount1: bigint }
  lastRebalance: number | null
}

/** The pool as its contract reads right now. */
export type V3PoolLive = {
  sqrtPriceX96: bigint
  tick: number
  /** Active liquidity at the current tick. */
  liquidity: bigint
  /**
   * Tokens the pool contract actually holds, raw units. Not `pool.tokens`:
   * those are the SDK's VIRTUAL reserves, which overstate a concentrated
   * pool's deposits by its concentration factor.
   */
  reserve0: bigint
  reserve1: bigint
  lpFeeShare: number
}

export type VaultSnapshot = {
  pool: V3PoolLive
  /** null when no Gamma stack has a vault for the pool. */
  vault: VaultState | null
}

export type VaultDepositChecks = {
  deposit0Max: bigint
  deposit1Max: bigint
  /** 0 when uncapped. */
  supplyCap: bigint
  /** false when a deposit would fail ClearingV2 TWAP checks */
  twapOk: boolean
}

/**
 * The pool's vault and the stack that created it: the first stack whose
 * factory knows the pair. Stacks are disjoint by construction — a factory
 * holds at most one vault per (token0, token1, fee).
 */
const findVault = async (
  evm: PublicClient,
  token0: `0x${string}`,
  token1: `0x${string}`,
  fee: number,
): Promise<{ hypervisor: `0x${string}`; stack: GammaStack } | null> => {
  const hypervisors = await Promise.all(
    GAMMA_STACKS.map((stack) =>
      evm.readContract({
        abi: FACTORY_ABI,
        address: stack.hypervisorFactory,
        functionName: "getHypervisor",
        args: [token0, token1, fee],
      }),
    ),
  )
  const index = hypervisors.findIndex(
    (hypervisor) => hypervisor.toLowerCase() !== zeroAddress,
  )
  const hypervisor = hypervisors[index]
  const stack = GAMMA_STACKS[index]

  return hypervisor && stack ? { hypervisor, stack } : null
}

export const vaultIdentityQuery = (evm: PublicClient, pool: V3PoolBase) =>
  queryOptions<VaultIdentity | null>({
    queryKey: ["vaultIdentity", pool.address],
    queryFn: async () => {
      const found =
        pool.addr0 && pool.addr1
          ? await findVault(evm, pool.addr0, pool.addr1, pool.fee)
          : null
      if (!found) return null

      const [shareSymbol, owner] = await Promise.all([
        readHypervisor<string>(evm, found.hypervisor, "symbol"),
        readHypervisor<`0x${string}`>(evm, found.hypervisor, "owner"),
      ])

      return { ...found, shareSymbol, owner }
    },
    staleTime: Infinity,
  })

const readPoolLive = async (
  evm: PublicClient,
  pool: V3PoolBase,
): Promise<V3PoolLive> => {
  const address = pool.address as `0x${string}`

  const balanceOf = (token: `0x${string}`) =>
    evm.readContract({
      abi: erc20Abi,
      address: token,
      functionName: "balanceOf",
      args: [address],
    })

  const [slot0, liquidity, reserve0, reserve1] = await Promise.all([
    evm.readContract({ abi: POOL_ABI, address, functionName: "slot0" }),
    evm.readContract({ abi: POOL_ABI, address, functionName: "liquidity" }),
    balanceOf(pool.addr0),
    balanceOf(pool.addr1),
  ])

  return {
    sqrtPriceX96: slot0[0],
    tick: Number(slot0[1]),
    liquidity,
    reserve0,
    reserve1,
    lpFeeShare: v3LpFeeShare(Number(slot0[5])),
  }
}

const readVaultLive = async (
  evm: PublicClient,
  pool: V3PoolBase,
  { hypervisor, stack, shareSymbol, owner }: VaultIdentity,
): Promise<VaultState> => {
  const read = <T>(functionName: HypervisorFn) =>
    readHypervisor<T>(evm, hypervisor, functionName)

  const readLastRebalance = (proxy: `0x${string}`) =>
    evm.readContract({
      abi: REBALANCE_PROXY_ABI,
      address: proxy,
      functionName: "lastRebalance",
      args: [hypervisor],
    })

  const [
    totalSupply,
    totals,
    baseLower,
    baseUpper,
    limitLower,
    limitUpper,
    whitelisted,
    base,
    limit,
    lastRebalance,
  ] = await Promise.all([
    read<bigint>("totalSupply"),
    read<[bigint, bigint]>("getTotalAmounts"),
    read<number>("baseLower"),
    read<number>("baseUpper"),
    read<number>("limitLower"),
    read<number>("limitUpper"),
    read<`0x${string}`>("whitelistedAddress"),
    read<[bigint, bigint, bigint]>("getBasePosition"),
    read<[bigint, bigint, bigint]>("getLimitPosition"),
    readLastRebalance(owner)
      .catch(() => readLastRebalance(stack.rebalanceProxy))
      .catch(() => null),
  ])

  return {
    address: hypervisor,
    shareSymbol,
    uniProxy: stack.uniProxy,
    token0: pool.addr0,
    token1: pool.addr1,
    totalSupply,
    total0: totals[0],
    total1: totals[1],
    baseLower,
    baseUpper,
    limitLower,
    limitUpper,
    whitelisted,
    base: { liquidity: base[0], amount0: base[1], amount1: base[2] },
    limit: { liquidity: limit[0], amount0: limit[1], amount1: limit[2] },
    // getTotalAmounts = token balances + base + limit (fees owed included),
    // so what's left is the hypervisor's idle balance. Checked on mainnet.
    idle: {
      amount0: totals[0] - base[1] - limit[1],
      amount1: totals[1] - base[2] - limit[2],
    },
    lastRebalance:
      lastRebalance && lastRebalance > 0n ? Number(lastRebalance) : null,
  }
}

const vaultSnapshotQuery = (
  evm: PublicClient,
  queryClient: QueryClient,
  pool: V3PoolBase,
) =>
  queryOptions<VaultSnapshot>({
    queryKey: ["vault", pool.address, "live"],
    queryFn: async () => {
      const identity = await queryClient.ensureQueryData(
        vaultIdentityQuery(evm, pool),
      )

      const [poolLive, vault] = await Promise.all([
        readPoolLive(evm, pool),
        identity ? readVaultLive(evm, pool, identity) : null,
      ])

      return { pool: poolLive, vault }
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

/** Per-pool snapshot, in the order the pools were given. */
export const useVaultSnapshots = (pools: V3PoolBase[]) => {
  const { evm } = useRpcProvider()
  const queryClient = useQueryClient()

  return useQueries({
    queries: pools.map((pool) => vaultSnapshotQuery(evm, queryClient, pool)),
    combine: (results) => ({
      data: results.map((result) => result.data ?? null),
      loading: results.map((result) => result.isLoading),
      isLoading: results.some((result) => result.isLoading),
    }),
  })
}

/** The connected account's shares per pool's vault; waits on identity only. */
export const useVaultShares = (pools: V3PoolBase[]) => {
  const { evm } = useRpcProvider()
  const queryClient = useQueryClient()
  const { account } = useAccount()

  const owner = account?.address
    ? (safeConvertAnyToH160(account.address) as Hex | null)
    : null

  return useQueries({
    queries: pools.map((pool) =>
      queryOptions<bigint>({
        queryKey: ["vault", pool.address, "shares", owner],
        enabled: !!owner,
        queryFn: async () => {
          const identity = await queryClient.ensureQueryData(
            vaultIdentityQuery(evm, pool),
          )
          if (!identity || !owner) return 0n

          return evm.readContract({
            abi: HYPERVISOR_ABI,
            address: identity.hypervisor,
            functionName: "balanceOf",
            args: [owner],
          })
        },
        staleTime: 30_000,
      }),
    ),
    combine: (results) => ({
      data: results.map((result) => result.data ?? 0n),
      isLoading: results.some((result) => result.isLoading),
      isError: results.some((result) => result.isError),
      isDisconnected: !owner,
    }),
  })
}

const readDepositChecks = async (
  evm: PublicClient,
  vault: VaultState,
): Promise<VaultDepositChecks> => {
  const read = <T>(functionName: HypervisorFn) =>
    readHypervisor<T>(evm, vault.address, functionName)

  const [maxTotalSupply, deposit0MaxOwn, deposit1MaxOwn, clearing] =
    await Promise.all([
      read<bigint>("maxTotalSupply"),
      read<bigint>("deposit0Max"),
      read<bigint>("deposit1Max"),
      evm.readContract({
        abi: UNIPROXY_CLEARANCE_ABI,
        address: vault.uniProxy,
        functionName: "clearance",
      }),
    ])

  const [twapCheck, twapInterval, priceThreshold, position] = await Promise.all(
    [
      evm.readContract({
        abi: CLEARING_ABI,
        address: clearing,
        functionName: "twapCheck",
      }),
      evm.readContract({
        abi: CLEARING_ABI,
        address: clearing,
        functionName: "twapInterval",
      }),
      evm.readContract({
        abi: CLEARING_ABI,
        address: clearing,
        functionName: "priceThreshold",
      }),
      evm.readContract({
        abi: CLEARING_ABI,
        address: clearing,
        functionName: "positions",
        args: [vault.address],
      }),
    ],
  )

  const {
    3: depositOverride,
    4: twapOverride,
    6: posTwapInterval,
    7: posPriceThreshold,
    8: posDeposit0Max,
    9: posDeposit1Max,
    10: posMaxTotalSupply,
  } = position

  const twapActive = twapCheck || twapOverride
  const twapOk = !twapActive
    ? true
    : await evm
        .readContract({
          abi: CLEARING_ABI,
          address: clearing,
          functionName: "checkPriceChange",
          args: [
            vault.address,
            twapOverride ? posTwapInterval : twapInterval,
            twapOverride ? posPriceThreshold : priceThreshold,
          ],
        })
        .then(() => true)
        .catch(() => false)

  const supplyCaps = [posMaxTotalSupply, maxTotalSupply].filter(
    (cap) => cap > 0n,
  )

  return {
    deposit0Max: depositOverride ? posDeposit0Max : deposit0MaxOwn,
    deposit1Max: depositOverride ? posDeposit1Max : deposit1MaxOwn,
    supplyCap: supplyCaps.length
      ? supplyCaps.reduce((min, cap) => (cap < min ? cap : min))
      : 0n,
    twapOk,
  }
}

/** Read while a deposit form is open; refetch right before submitting. */
export const useVaultDepositChecks = (vault: VaultState | null) => {
  const { evm } = useRpcProvider()

  return useQuery({
    queryKey: ["vaultDepositChecks", vault?.address],
    enabled: !!vault,
    queryFn: () => (vault ? readDepositChecks(evm, vault) : null),
    staleTime: 0,
    refetchInterval: 30_000,
  })
}

/** What a deposit or withdraw into the pool's vault makes stale. */
export const vaultTxInvalidation = (pool: V3PoolBase): string[][] => [
  ["vault", pool.address],
  // the pool's tick list (distribution chart) moves with the vault's mint/burn
  ["allPools"],
  ["pools", "v3"],
]
