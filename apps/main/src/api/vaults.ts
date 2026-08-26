import { safeConvertAnyToH160 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { queryOptions, useQueries } from "@tanstack/react-query"
import { Hex, parseAbi, PublicClient } from "viem"

import { V3PoolBase } from "@/api/pools"
import { useRpcProvider } from "@/providers/rpcProvider"

const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000"

// Gamma addresses are not in chain state, so unlike the v3 factory they cannot be
// discovered. A vault is only visible on a network listed below. Addresses of
// record: mainnet/DEPLOYMENTS.md in galacticcouncil/uniswap-v3-deploy.
type GammaDeployment = {
  hypervisorFactory: `0x${string}`
  /** Only address allowed to take deposits */
  uniProxy: `0x${string}`
  /** Fallback for lastRebalance; the fork still has an EOA as Hypervisor.owner() */
  rebalanceProxy?: `0x${string}`
}

const GAMMA_DEPLOYMENT: (GammaDeployment & { hosts: string[] })[] = [
  {
    hosts: ["4.lark.hydration.cloud", "node4.lark.hydration.cloud"],
    // redeployed after the 2026-08-26 fork reset
    hypervisorFactory: "0x9E545E3C0baAB3E08CdfD552C960A1050f373042",
    uniProxy: "0x851356ae760d987E095750cCeb3bC6014560891C",
    rebalanceProxy: "0x4826533B4897376654Bb4d4AD88B7faFD0C98528",
  },
]

const hostOf = (url: string) => {
  try {
    return new URL(url).host
  } catch {
    return ""
  }
}

const deploymentFor = (urls: string[]): GammaDeployment | undefined => {
  const hosts = new Set(urls.map(hostOf).filter(Boolean))

  return GAMMA_DEPLOYMENT.find((entry) =>
    entry.hosts.some((host) => hosts.has(host)),
  )
}

const ERC20_BALANCE_ABI = parseAbi([
  "function balanceOf(address) view returns (uint256)",
])

const FACTORY_ABI = parseAbi([
  "function getHypervisor(address,address,uint24) view returns (address)",
])

const UNIPROXY_CLEARANCE_ABI = parseAbi([
  "function clearance() view returns (address)",
])

// checkPriceChange is the exact TWAP test clearDeposit runs, so calling it is
// the pre-check rather than an approximation.
const CLEARING_ABI = parseAbi([
  "function twapCheck() view returns (bool)",
  "function twapInterval() view returns (uint32)",
  "function priceThreshold() view returns (uint256)",
  "function positions(address) view returns (bool customRatio, bool customTwap, bool ratioRemoved, bool depositOverride, bool twapOverride, uint8 version, uint32 twapInterval, uint256 priceThreshold, uint256 deposit0Max, uint256 deposit1Max, uint256 maxTotalSupply, uint256 fauxTotal0, uint256 fauxTotal1, uint256 customDepositDelta)",
  "function checkPriceChange(address pos, uint32 _twapInterval, uint256 _priceThreshold) view returns (uint256 price)",
])

const REBALANCE_PROXY_ABI = parseAbi([
  "function lastRebalance(address) view returns (uint256)",
])

const HYPERVISOR_ABI = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function getBasePosition() view returns (uint128 liquidity, uint256 amount0, uint256 amount1)",
  "function getLimitPosition() view returns (uint128 liquidity, uint256 amount0, uint256 amount1)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function getTotalAmounts() view returns (uint256,uint256)",
  "function baseLower() view returns (int24)",
  "function baseUpper() view returns (int24)",
  "function limitLower() view returns (int24)",
  "function limitUpper() view returns (int24)",
  "function whitelistedAddress() view returns (address)",
  "function maxTotalSupply() view returns (uint256)",
  "function deposit0Max() view returns (uint256)",
  "function deposit1Max() view returns (uint256)",
  "function owner() view returns (address)",
])

type HypervisorFn = Extract<
  (typeof HYPERVISOR_ABI)[number],
  { type: "function" }
>["name"]

export type VaultState = {
  address: `0x${string}`
  /** Deposit entry point, applies the ClearingV2 guards */
  uniProxy: `0x${string}`
  /** Contract addresses, in the pool's own sort order */
  token0: `0x${string}`
  token1: `0x${string}`
  totalSupply: bigint
  /** Underlying the vault holds, base + limit + idle */
  total0: bigint
  total1: bigint
  baseLower: number
  baseUpper: number
  limitLower: number
  limitUpper: number
  shareSymbol: string
  /** Only address allowed to call deposit, the UniProxy once set */
  whitelisted: `0x${string}`
  /** base straddles the price, limit holds the surplus side, idle is undeployed */
  base: { liquidity: bigint; amount0: bigint; amount1: bigint }
  limit: { liquidity: bigint; amount0: bigint; amount1: bigint }
  idle: { amount0: bigint; amount1: bigint }
  /** Per-deposit caps as ClearingV2 enforces them. uint256 max means uncapped. */
  deposit0Max: bigint
  deposit1Max: bigint
  /** Tightest total-supply cap on the deposit path. Zero means uncapped. */
  supplyCap: bigint
  /** False means a deposit sent now reverts, until price and TWAP reconverge. */
  twapOk: boolean
  /** Unix seconds of the keeper's last rebalance, null when unknowable */
  lastRebalance: number | null
}

const vaultQuery = (
  evm: PublicClient,
  deployment: GammaDeployment | undefined,
  pool: V3PoolBase,
) =>
  queryOptions<VaultState | null>({
    queryKey: ["vault", pool.address, deployment?.hypervisorFactory],
    enabled: !!deployment,
    queryFn: async () => {
      if (!deployment) return null
      const factory = deployment.hypervisorFactory

      // Use the pool's own token contracts. An Erc20 asset does not live at its
      // id alias, so re-deriving them would address a different pool.
      const { addr0: token0, addr1: token1 } = pool
      if (!token0 || !token1) return null

      const hypervisor = await evm.readContract({
        abi: FACTORY_ABI,
        address: factory,
        functionName: "getHypervisor",
        args: [token0, token1, pool.fee],
      })

      if (hypervisor.toLowerCase() === ADDRESS_ZERO) return null

      const read = <T>(functionName: HypervisorFn) =>
        evm.readContract({
          abi: HYPERVISOR_ABI,
          address: hypervisor,
          functionName,
        }) as Promise<T>

      const [
        shareSymbol,
        totalSupply,
        totals,
        baseLower,
        baseUpper,
        limitLower,
        limitUpper,
        whitelisted,
        maxTotalSupply,
        deposit0MaxOwn,
        deposit1MaxOwn,
        owner,
        base,
        limit,
        idle0,
        idle1,
        clearing,
      ] = await Promise.all([
        read<string>("symbol"),
        read<bigint>("totalSupply"),
        read<[bigint, bigint]>("getTotalAmounts"),
        read<number>("baseLower"),
        read<number>("baseUpper"),
        read<number>("limitLower"),
        read<number>("limitUpper"),
        read<`0x${string}`>("whitelistedAddress"),
        read<bigint>("maxTotalSupply"),
        read<bigint>("deposit0Max"),
        read<bigint>("deposit1Max"),
        read<`0x${string}`>("owner"),
        read<[bigint, bigint, bigint]>("getBasePosition"),
        read<[bigint, bigint, bigint]>("getLimitPosition"),
        evm.readContract({
          abi: ERC20_BALANCE_ABI,
          address: token0,
          functionName: "balanceOf",
          args: [hypervisor],
        }),
        evm.readContract({
          abi: ERC20_BALANCE_ABI,
          address: token1,
          functionName: "balanceOf",
          args: [hypervisor],
        }),
        evm.readContract({
          abi: UNIPROXY_CLEARANCE_ABI,
          address: deployment.uniProxy,
          functionName: "clearance",
        }),
      ])

      const [twapCheck, twapInterval, priceThreshold, position, lastRebalance] =
        await Promise.all([
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
            args: [hypervisor],
          }),
          // Owner should be the RebalanceProxy; fall back to the pinned address.
          evm
            .readContract({
              abi: REBALANCE_PROXY_ABI,
              address: owner,
              functionName: "lastRebalance",
              args: [hypervisor],
            })
            .catch(() =>
              deployment.rebalanceProxy
                ? evm
                    .readContract({
                      abi: REBALANCE_PROXY_ABI,
                      address: deployment.rebalanceProxy,
                      functionName: "lastRebalance",
                      args: [hypervisor],
                    })
                    .catch(() => null)
                : null,
            ),
        ])

      const {
        3: depositOverride,
        4: twapOverride,
        6: posTwapInterval,
        7: posPriceThreshold,
        8: posDeposit0Max,
        9: posDeposit1Max,
        10: posMaxTotalSupply,
      } = position

      // Mirrors ClearingV2.clearDeposit: the override swaps in its own window
      // and threshold.
      const twapActive = twapCheck || twapOverride
      const twapOk = !twapActive
        ? true
        : await evm
            .readContract({
              abi: CLEARING_ABI,
              address: clearing,
              functionName: "checkPriceChange",
              args: [
                hypervisor,
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
        address: hypervisor,
        shareSymbol,
        uniProxy: deployment.uniProxy,
        token0,
        token1,
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
        idle: { amount0: idle0, amount1: idle1 },
        deposit0Max: depositOverride ? posDeposit0Max : deposit0MaxOwn,
        deposit1Max: depositOverride ? posDeposit1Max : deposit1MaxOwn,
        supplyCap: supplyCaps.length
          ? supplyCaps.reduce((min, cap) => (cap < min ? cap : min))
          : 0n,
        twapOk,
        lastRebalance:
          lastRebalance && lastRebalance > 0n ? Number(lastRebalance) : null,
      }
    },
    staleTime: 30_000,
  })

/** Managing vault per pool, null where none exists */
export const useVaultStates = (pools: V3PoolBase[]) => {
  const { evm, rpcUrlList, endpoint } = useRpcProvider()

  const deployment = deploymentFor([endpoint, ...rpcUrlList].filter(Boolean))

  return useQueries({
    queries: pools.map((pool) => vaultQuery(evm, deployment, pool)),
    combine: (results) => ({
      data: results.map((result) => result.data ?? null),
      isLoading: results.some((result) => result.isLoading),
    }),
  })
}

/** Share balance per vault. Zero when no wallet is connected. */
export const useVaultShares = (vaults: (VaultState | null)[]) => {
  const { evm } = useRpcProvider()
  const { account } = useAccount()

  const owner = account?.address
    ? (safeConvertAnyToH160(account.address) as Hex | null)
    : null

  return useQueries({
    queries: vaults.map((vault) =>
      queryOptions<bigint>({
        queryKey: ["vaultShares", vault?.address, owner],
        enabled: !!vault && !!owner,
        queryFn: async () => {
          if (!vault || !owner) return 0n

          return evm.readContract({
            abi: HYPERVISOR_ABI,
            address: vault.address,
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
      // a failed read is not an empty position
      isError: results.some((result) => result.isError),
      /** No wallet connected */
      isDisconnected: !owner,
    }),
  })
}
