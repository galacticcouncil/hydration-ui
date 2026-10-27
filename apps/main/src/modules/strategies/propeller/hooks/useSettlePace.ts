import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import { formatUnits, type Hex, parseAbiItem } from "viem"

import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import { VAULT_DEPLOY_BLOCK } from "@/modules/strategies/propeller/constants"
import { propellerQueryKeys } from "@/modules/strategies/propeller/utils/queryKeys"
import { type SettleLog } from "@/modules/strategies/propeller/utils/withdrawalEta"
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

/** blocks re-read on every refresh in case a reorg replaced them */
const REORG_DEPTH = 64n

/**
 * How far back the settle pace looks (~2.3 days at 2 s blocks): long enough
 * to reach the last stretch the keeper was busy, even on a quiet vault.
 */
const PACE_WINDOW_BLOCKS = 100_000n

// ponytail: in-memory per session; persist to IndexedDB if cold loads get slow
const paceScans = new Map<Hex, VaultScan>()

/**
 * Every tranche settled in the pace window, any owner. Scans the window once,
 * then only new blocks plus the reorgable tail.
 */
export const vaultSettleLogsQuery = (
  { isReady, evm }: TProviderContext,
  vault: PropellerVaultConfig,
  decimals: number,
) =>
  queryOptions({
    queryKey: propellerQueryKeys.vaultSettlePace(vault.vaultAddress),
    enabled: isReady,
    queryFn: async (): Promise<{ head: bigint; logs: SettleLog[] }> => {
      const head = await evm.getBlockNumber()
      const windowStart =
        head - PACE_WINDOW_BLOCKS > VAULT_DEPLOY_BLOCK
          ? head - PACE_WINDOW_BLOCKS
          : VAULT_DEPLOY_BLOCK
      const scan = paceScans.get(vault.vaultAddress) ?? {
        from: windowStart,
        to: windowStart - 1n,
        logs: new Map(),
      }
      paceScans.set(vault.vaultAddress, scan)

      const redo = scan.to - REORG_DEPTH + 1n
      const from = redo > scan.from ? redo : scan.from
      for (const [key, l] of scan.logs) {
        if (l.blockNumber >= from || l.blockNumber < windowStart)
          scan.logs.delete(key)
      }
      const ranges: [bigint, bigint][] = []
      for (let start = from; start <= head; start += LOG_CHUNK) {
        const end = start + LOG_CHUNK - 1n
        ranges.push([start, end < head ? end : head])
      }
      for (let i = 0; i < ranges.length; i += SCAN_CONCURRENCY) {
        const batch = await Promise.all(
          ranges.slice(i, i + SCAN_CONCURRENCY).map(([fromBlock, toBlock]) =>
            evm.getLogs({
              address: vault.vaultAddress,
              event: SETTLED_EVENT,
              fromBlock,
              toBlock,
            }),
          ),
        )
        for (const l of batch.flat()) {
          if (!l.blockHash || l.blockNumber === null) continue
          scan.logs.set(`${l.blockHash}:${l.logIndex}`, {
            requestId: Number(l.args.requestId!),
            collateral: l.args.collateral!,
            blockNumber: l.blockNumber,
          })
        }
      }
      scan.from = windowStart > scan.from ? windowStart : scan.from
      scan.to = head

      return {
        head,
        logs: [...scan.logs.values()].map((l) => ({
          requestId: l.requestId,
          collateral: Number(formatUnits(l.collateral, decimals)),
          blockNumber: l.blockNumber,
        })),
      }
    },
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
    staleTime: 15_000,
  })
