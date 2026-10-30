import { queryOptions } from "@tanstack/react-query"
import { erc20Abi, getContract, type Hex, parseAbiItem } from "viem"

import {
  EXECUTION_CONTROLLER_ABI,
  MAIN_DEBT_ABI,
  POOL_ABI,
  SUBLOOP_ABI,
  VAULT_ABI,
  YIELD_ACCOUNTING_ABI,
} from "@/modules/strategies/propeller/config/abi"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import {
  HOLLAR_ADDRESS,
  POOL_ADDRESS,
  SUBLOOP_ADDRESS,
} from "@/modules/strategies/propeller/constants"
import {
  type DeploymentState,
  type HeadroomState,
} from "@/modules/strategies/propeller/utils/headroomExit"
import { propellerQueryKeys } from "@/modules/strategies/propeller/utils/queryKeys"
import { TProviderContext } from "@/providers/rpcProvider"

/**
 * What a headroom exit is judged on, at one block, with how the keeper will
 * deploy waiting credit before the exit starts.
 */
export type HeadroomSnapshot = HeadroomState & {
  /** the block's timestamp, ms: exits start relative to it */
  observedAt: number
}

const REBALANCED = parseAbiItem(
  "event Rebalanced(uint256 ltvBefore, uint256 ltvAfter)",
)
/** how far back the vault's rebalances are read to time the keeper */
const CADENCE_WINDOW_BLOCKS = 3_000n
const CADENCE_GAPS = 20
/**
 * a longer pause between rebalances means nothing was waiting to deploy: with
 * credit waiting the keeper borrows a slice every 6-54 s (4.lark)
 */
const IDLE_GAP_SECONDS = 90

// block timestamps never change; keep them for the session
const blockTimes = new Map<bigint, number>()

/**
 * Seconds per deploying rebalance: each borrows one entry slice the moment the
 * lane admits it, faster than the loop then buys with it. They come in pairs
 * (6 s then 54 s apart on 4.lark), so the rate is the mean gap, not the median.
 * Unknown, it deploys at once: the earliest the headroom can close.
 */
const measureDeploySeconds = async (
  evm: TProviderContext["evm"],
  vault: Hex,
  head: bigint,
) => {
  const logs = await evm.getLogs({
    address: vault,
    event: REBALANCED,
    fromBlock: head > CADENCE_WINDOW_BLOCKS ? head - CADENCE_WINDOW_BLOCKS : 0n,
    toBlock: head,
  })
  const blocks = [...new Set(logs.map((l) => l.blockNumber))]
    .filter((b): b is bigint => b !== null)
    .slice(-(CADENCE_GAPS + 1))
  await Promise.all(
    blocks
      .filter((b) => !blockTimes.has(b))
      .map(async (b) =>
        blockTimes.set(
          b,
          Number((await evm.getBlock({ blockNumber: b })).timestamp),
        ),
      ),
  )
  const gaps = blocks
    .slice(1)
    .map((b, i) => blockTimes.get(b)! - blockTimes.get(blocks[i]!)!)
    .filter((gap) => gap > 0 && gap <= IDLE_GAP_SECONDS)
  return gaps.length === 0
    ? 0
    : gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length
}

/** The keeper's deployment of the vault's waiting credit; null when there is none. */
const readDeployment = async (
  evm: TProviderContext["evm"],
  vault: PropellerVaultConfig,
  credit: bigint,
  head: bigint,
): Promise<DeploymentState | null> => {
  if (credit === 0n) return null
  const options = { blockNumber: head }
  const subLoop = getContract({
    address: SUBLOOP_ADDRESS,
    abi: SUBLOOP_ABI,
    client: evm,
  })
  const [[bandGapBps], controller, primeAToken] = await Promise.all([
    subLoop.read.rebalanceBand([vault.vaultAddress], options),
    subLoop.read.executionController(options),
    subLoop.read.primeAToken(options),
  ])
  const execution = getContract({
    address: controller,
    abi: EXECUTION_CONTROLLER_ABI,
    client: evm,
  })
  // the entry lane each rebalance's borrow is fitted to
  const lane = await execution.read.lane([
    SUBLOOP_ADDRESS,
    HOLLAR_ADDRESS,
    primeAToken,
  ])
  const [, , sliceHollar] = await execution.read.limits([lane], options)
  return {
    credit,
    bandGapBps,
    sliceHollar,
    sliceSeconds: await measureDeploySeconds(evm, vault.vaultAddress, head),
  }
}

/** What a waiting exit is judged on as the keeper will start it, at one block. */
export const exitHeadroomQuery = (
  { isReady, evm }: TProviderContext,
  vault: PropellerVaultConfig,
) =>
  queryOptions({
    queryKey: propellerQueryKeys.exitHeadroom(vault.vaultAddress),
    enabled: isReady,
    queryFn: async (): Promise<HeadroomSnapshot> => {
      const block = await evm.getBlock()
      const options = { blockNumber: block.number }
      const subLoop = getContract({
        address: SUBLOOP_ADDRESS,
        abi: SUBLOOP_ABI,
        client: evm,
      })
      // off, or a loop from before headroom exits: every exit unwinds, and its
      // claim on the loop is still what the estimate needs
      const [enabled, gapBps] = await subLoop.read
        .exitHeadroom([vault.vaultAddress], options)
        .catch(() => [false, 0] as const)
      const contract = getContract({
        address: vault.vaultAddress,
        abi: VAULT_ABI,
        client: evm,
      })
      const [collateral, aToken, mainDebt, accounting] = await Promise.all([
        contract.read.asset(),
        contract.read.collateralAToken(),
        contract.read.mainDebt(),
        contract.read.yieldAccounting(),
      ])
      const balanceOf = (token: Hex) =>
        evm.readContract({
          address: token,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [vault.vaultAddress],
          ...options,
        })
      const ledger = getContract({
        address: mainDebt,
        abi: MAIN_DEBT_ABI,
        client: evm,
      })
      const fund = getContract({
        address: accounting,
        abi: YIELD_ACCOUNTING_ABI,
        client: evm,
      })
      const [
        reserveConfig,
        account,
        supplied,
        idle,
        roundingReserve,
        totalAssets,
        queuedCollateral,
        totalSupply,
        queuedShares,
        syntheticSupplied,
        loopShares,
        queuedDebt,
        reservedShares,
        sourceEquity,
        sourceShares,
        [activeDebt, , activeCash],
        protocolReserve,
        credit,
      ] = await Promise.all([
        evm.readContract({
          address: POOL_ADDRESS,
          abi: POOL_ABI,
          functionName: "getConfiguration",
          args: [collateral],
          ...options,
        }),
        evm.readContract({
          address: POOL_ADDRESS,
          abi: POOL_ABI,
          functionName: "getUserAccountData",
          args: [vault.vaultAddress],
          ...options,
        }),
        balanceOf(aToken),
        balanceOf(collateral),
        contract.read.roundingReserve(options),
        contract.read.totalAssets(options),
        contract.read.totalQueuedCollateral(options),
        contract.read.totalSupply(options),
        contract.read.totalQueuedShares(options),
        contract.read.syntheticSupplied(options),
        contract.read.loopShares(options),
        contract.read.totalQueuedDebt(options),
        fund.read.reservedShares(options),
        subLoop.read.equityOf([vault.vaultAddress], options),
        subLoop.read.sharesOf([vault.vaultAddress], options),
        ledger.read.activePosition(options),
        ledger.read.protocolReserve(options),
        contract.read.reinvestAssets(options),
      ])
      return {
        headroomOn: enabled,
        gapBps,
        reserveConfig,
        supplied,
        idle,
        roundingReserve,
        totalAssets,
        queuedCollateral,
        supply: totalSupply - queuedShares,
        collateralBase: account[0],
        debtBase: account[1],
        syntheticSupplied,
        loopShares,
        reservedShares,
        sourceEquity,
        sourceShares,
        activeDebt,
        activeCash,
        queuedDebt,
        protocolReserve,
        deployment: await readDeployment(evm, vault, credit, block.number),
        observedAt: Number(block.timestamp) * 1000,
      }
    },
    refetchInterval: 30_000,
  })
