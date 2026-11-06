import { queryOptions } from "@tanstack/react-query"
import { erc20Abi, formatUnits, getContract, parseAbiItem } from "viem"

import {
  EXECUTION_CONTROLLER_ABI,
  POOL_ABI,
  PRICE_ORACLE_ABI,
  SUBLOOP_ABI,
} from "@/modules/strategies/propeller/config/abi"
import {
  HOLLAR_ADDRESS,
  POOL_ADDRESS,
  PRIME_ADDRESS,
  SUBLOOP_ADDRESS,
} from "@/modules/strategies/propeller/constants"
import { propellerQueryKeys } from "@/modules/strategies/propeller/utils/queryKeys"
import { type ExitBacklog } from "@/modules/strategies/propeller/utils/withdrawalEta"
import { TProviderContext } from "@/providers/rpcProvider"

/** pendingIntent().kind of an exit sale */
const EXIT_INTENT = 2

const INTENT_SUBMITTED = parseAbiItem(
  "event IntentSubmitted(uint8 indexed kind, uint64 indexed nonce, uint256 amountIn, uint256 minOut, uint64 deadline)",
)
/** how far back exit sales are read to time the keeper (~1.7 h at 2 s) */
const CADENCE_WINDOW_BLOCKS = 3_000n
/** the latest slice gaps say how the keeper runs now */
const CADENCE_GAPS = 20
/** a longer pause between sales means no exit was open, not a slow keeper */
const IDLE_GAP_SECONDS = 300
/** a keeper turn on top of the pacing interval when no sales were seen */
const KEEPER_SLACK_SECONDS = 5

// block timestamps never change; keep them for the session
const blockTimes = new Map<bigint, number>()

/**
 * Seconds per exit slice as the keeper has really run them: the pacing
 * interval is only a floor, missed keeper turns stretch it (60 s paced, 66
 * and 85 s measured on 0.lark). Falls back to the interval plus a turn.
 */
const measureSliceSeconds = async (
  evm: TProviderContext["evm"],
  head: bigint,
  interval: number,
) => {
  const logs = await evm.getLogs({
    address: SUBLOOP_ADDRESS,
    event: INTENT_SUBMITTED,
    args: { kind: EXIT_INTENT },
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
  if (gaps.length === 0) return interval + KEEPER_SLACK_SECONDS
  const average = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length
  return Math.max(average, interval)
}

/**
 * What the keeper still has to free for withdrawals, and how fast. One SubLoop
 * serves every vault: it sells one slice of aPRIME per pacing interval and
 * credits the freed HOLLAR to every started withdrawal pro rata, so they all
 * finish together, in either vault.
 */
export const exitBacklogQuery = ({ isReady, evm }: TProviderContext) =>
  queryOptions({
    queryKey: propellerQueryKeys.exitBacklog(),
    enabled: isReady,
    queryFn: async (): Promise<ExitBacklog> => {
      const subLoop = getContract({
        address: SUBLOOP_ADDRESS,
        abi: SUBLOOP_ABI,
        client: evm,
      })
      const pool = getContract({
        address: POOL_ADDRESS,
        abi: POOL_ABI,
        client: evm,
      })
      const head = await evm.getBlockNumber()
      const options = { blockNumber: head }
      const [
        unwindTargetEquity,
        tranche,
        reservedFreed,
        deleverTarget,
        paused,
        controller,
        primeAToken,
        pendingIntent,
        account,
        idleHollar,
      ] = await Promise.all([
        subLoop.read.unwindTargetEquity(options),
        subLoop.read.unwindTranche(options),
        subLoop.read.reservedFreed(options),
        subLoop.read.deleverDebtTarget(options),
        subLoop.read.emergencyPaused(options),
        subLoop.read.executionController(options),
        subLoop.read.primeAToken(options),
        subLoop.read.pendingIntent(options),
        pool.read.getUserAccountData([SUBLOOP_ADDRESS], options),
        evm.readContract({
          address: HOLLAR_ADDRESS,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [SUBLOOP_ADDRESS],
          ...options,
        }),
      ])
      const execution = getContract({
        address: controller,
        abi: EXECUTION_CONTROLLER_ABI,
        client: evm,
      })
      const lane = await execution.read.lane([
        SUBLOOP_ADDRESS,
        primeAToken,
        HOLLAR_ADDRESS,
      ])
      const [group, , laneMax] = await execution.read.limits([lane], options)
      const provider = await evm.readContract({
        address: POOL_ADDRESS,
        abi: PRICE_ORACLE_ABI,
        functionName: "ADDRESSES_PROVIDER",
      })
      const oracle = await evm.readContract({
        address: provider,
        abi: PRICE_ORACLE_ABI,
        functionName: "getPriceOracle",
      })
      const price = (asset: `0x${string}`) =>
        evm.readContract({
          address: oracle,
          abi: PRICE_ORACLE_ABI,
          functionName: "getAssetPrice",
          args: [asset],
          ...options,
        })
      const [[interval], primePrice, hollarPrice, primeDecimals] =
        await Promise.all([
          execution.read.pacing([group], options),
          price(PRIME_ADDRESS),
          price(HOLLAR_ADDRESS),
          evm.readContract({
            address: primeAToken,
            abi: erc20Abi,
            functionName: "decimals",
          }),
        ])

      const slice = tranche < laneMax ? tranche : laneMax
      // the HOLLAR one slice sells for, and the part of it that is equity:
      // the rest repays the loop's own Aave debt
      const sliceHollar =
        (Number(formatUnits(slice, primeDecimals)) * Number(primePrice)) /
        Number(hollarPrice)
      const [collateralBase, debtBase] = account
      const equityShare =
        collateralBase > 0n ? 1 - Number(debtBase) / Number(collateralBase) : 0
      const freedPerSlice = sliceHollar * equityShare
      // HOLLAR already in the loop (a filled slice, deposit cash) is credited
      // on the next keeper turn, as is an exit sale still in flight
      const idle = Number(formatUnits(idleHollar - reservedFreed, 18))
      const comingSoon =
        Math.max(idle, 0) * equityShare +
        (pendingIntent[2] === EXIT_INTENT ? freedPerSlice : 0)

      return {
        sliceSeconds: await measureSliceSeconds(evm, head, Number(interval)),
        backlogHollar: Math.max(
          Number(formatUnits(unwindTargetEquity, 18)) - comingSoon,
          0,
        ),
        freedPerSlice,
        // a safety de-lever frees nothing for withdrawals; a pause stops all
        stalled: deleverTarget > 0n || paused,
      }
    },
    refetchInterval: 15_000,
  })
