import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import { formatUnits, type Hex, parseAbiItem } from "viem"

import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import { VAULT_DEPLOY_BLOCK } from "@/modules/strategies/propeller/constants"
import { propellerQueryKeys } from "@/modules/strategies/propeller/utils/queryKeys"
import { TProviderContext } from "@/providers/rpcProvider"

// Only RedeemSettled shows up in eth_getLogs. User vault calls go through
// pallet-evm, not native Ethereum txs, so Deposited / RedeemRequested / Claimed
// never appear. Keeper settlements do.
const SETTLED_EVENT = parseAbiItem(
  "event RedeemSettled(uint256 indexed requestId, uint256 collateral)",
)

// Frontier eth_getLogs walks every block in range (~27 ms per 1k blocks), so
// cost scales with range, not with matches.
const LOG_CHUNK = 10_000n
// ponytail: fixed fan-out; lower it if the RPC starts rate-limiting getLogs
const SCAN_CONCURRENCY = 8

type SettlementLog = {
  requestId: number
  collateral: bigint
  blockNumber: bigint
}

type VaultScan = {
  /** Inclusive block range already scanned. */
  from: bigint
  to: bigint
  /** Keyed by `${blockHash}:${logIndex}` so overlapping scans can't double count. */
  logs: Map<string, SettlementLog>
}

// ponytail: in-memory per session; persist to IndexedDB if cold loads get slow
const scans = new Map<Hex, VaultScan>()

export interface RedemptionSettlement {
  requestId: number
  /** Collateral released across all settlement tranches; only recorded here. */
  collateralSettled: number
  /** Resolve to a date lazily via `blockTimestampQuery`. */
  firstSettledBlock: bigint
}

/**
 * Measured payout totals and first settlement blocks by requestId. Scans new
 * blocks forward, and old blocks backward only until every tranche of
 * `minRequestId` is covered.
 */
export const vaultSettlementsQuery = (
  { isReady, evm }: TProviderContext,
  vault: PropellerVaultConfig,
  decimals: number,
  minRequestId: number | undefined,
) =>
  queryOptions({
    queryKey: propellerQueryKeys.vaultSettlements(
      vault.vaultAddress,
      minRequestId,
    ),
    enabled: isReady && minRequestId !== undefined,
    queryFn: async (): Promise<RedemptionSettlement[]> => {
      const head = await evm.getBlockNumber()
      const scan = scans.get(vault.vaultAddress) ?? {
        from: head + 1n,
        to: head,
        logs: new Map(),
      }
      scans.set(vault.vaultAddress, scan)

      const scanRange = async (fromBlock: bigint, toBlock: bigint) => {
        const logs = await evm.getLogs({
          address: vault.vaultAddress,
          event: SETTLED_EVENT,
          fromBlock,
          toBlock,
        })
        for (const l of logs) {
          if (!l.blockHash || l.blockNumber === null) continue
          scan.logs.set(`${l.blockHash}:${l.logIndex}`, {
            requestId: Number(l.args.requestId!),
            collateral: l.args.collateral!,
            blockNumber: l.blockNumber,
          })
        }
      }

      if (head > scan.to) {
        await scanRange(scan.to + 1n, head)
        scan.to = head > scan.to ? head : scan.to
      }

      // Settlement is FIFO: once an older request's log is in range, every
      // tranche of minRequestId (and later) is too.
      const coversMin = () =>
        [...scan.logs.values()].some((l) => l.requestId < minRequestId!)
      // Chunks are independent, so walk back SCAN_CONCURRENCY at a time.
      while (scan.from > VAULT_DEPLOY_BLOCK && !coversMin()) {
        const ranges: [bigint, bigint][] = []
        let end = scan.from - 1n
        while (ranges.length < SCAN_CONCURRENCY && end >= VAULT_DEPLOY_BLOCK) {
          const start =
            end - LOG_CHUNK + 1n > VAULT_DEPLOY_BLOCK
              ? end - LOG_CHUNK + 1n
              : VAULT_DEPLOY_BLOCK
          ranges.push([start, end])
          end = start - 1n
        }
        await Promise.all(ranges.map(([from, to]) => scanRange(from, to)))
        scan.from = end + 1n
      }

      const byId = new Map<
        number,
        { collateral: bigint; firstSettledBlock: bigint }
      >()
      for (const l of scan.logs.values()) {
        const entry = byId.get(l.requestId) ?? {
          collateral: 0n,
          firstSettledBlock: l.blockNumber,
        }
        // _retireExhaustedHead can emit RedeemSettled(id, 0) with no collateral.
        entry.collateral += l.collateral
        if (l.blockNumber < entry.firstSettledBlock) {
          entry.firstSettledBlock = l.blockNumber
        }
        byId.set(l.requestId, entry)
      }

      return [...byId].map(
        ([requestId, { collateral, firstSettledBlock }]) => ({
          requestId,
          collateralSettled: Number(formatUnits(collateral, decimals)),
          firstSettledBlock,
        }),
      )
    },
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
    staleTime: 30_000,
  })

/** Block timestamps never change, so fetch once and keep forever. */
export const blockTimestampQuery = (
  { isReady, evm }: TProviderContext,
  blockNumber: bigint | undefined,
) =>
  queryOptions({
    queryKey: propellerQueryKeys.blockTimestamp(blockNumber?.toString()),
    enabled: isReady && blockNumber !== undefined,
    queryFn: async () => {
      const block = await evm.getBlock({ blockNumber })
      return new Date(Number(block.timestamp) * 1000)
    },
    staleTime: Infinity,
  })
