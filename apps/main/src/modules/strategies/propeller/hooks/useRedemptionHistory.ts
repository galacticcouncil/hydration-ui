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

type SettlementLog = {
  requestId: number
  collateral: bigint
  blockHash: Hex
}

type VaultScan = {
  /** Inclusive block range already scanned. */
  from: bigint
  to: bigint
  /** Keyed by `${blockHash}:${logIndex}` so overlapping scans can't double count. */
  logs: Map<string, SettlementLog>
  timestamps: Map<Hex, Date>
}

// ponytail: in-memory per session; persist to IndexedDB if cold loads get slow
const scans = new Map<Hex, VaultScan>()

export interface RedemptionSettlement {
  requestId: number
  /** Collateral released across all settlement tranches; only recorded here. */
  collateralSettled: number
  firstSettledAt?: Date
}

/**
 * Measured payout totals and first settlement dates by requestId. Scans new
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
        timestamps: new Map(),
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
          if (!l.blockHash) continue
          scan.logs.set(`${l.blockHash}:${l.logIndex}`, {
            requestId: Number(l.args.requestId!),
            collateral: l.args.collateral!,
            blockHash: l.blockHash,
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
      while (scan.from > VAULT_DEPLOY_BLOCK && !coversMin()) {
        const start =
          scan.from - LOG_CHUNK > VAULT_DEPLOY_BLOCK
            ? scan.from - LOG_CHUNK
            : VAULT_DEPLOY_BLOCK
        await scanRange(start, scan.from - 1n)
        if (start < scan.from) scan.from = start
      }

      const missingHashes = [
        ...new Set([...scan.logs.values()].map((l) => l.blockHash)),
      ].filter((hash) => !scan.timestamps.has(hash))
      const blocks = await Promise.all(
        missingHashes.map((blockHash) => evm.getBlock({ blockHash })),
      )
      for (const b of blocks) {
        if (b.hash) {
          scan.timestamps.set(b.hash, new Date(Number(b.timestamp) * 1000))
        }
      }

      const byId = new Map<
        number,
        { collateral: bigint; firstSettledAt?: Date }
      >()
      for (const l of scan.logs.values()) {
        const ts = scan.timestamps.get(l.blockHash)
        const entry = byId.get(l.requestId) ?? { collateral: 0n }
        // _retireExhaustedHead can emit RedeemSettled(id, 0) with no collateral.
        entry.collateral += l.collateral
        if (ts && (!entry.firstSettledAt || ts < entry.firstSettledAt)) {
          entry.firstSettledAt = ts
        }
        byId.set(l.requestId, entry)
      }

      return [...byId].map(([requestId, { collateral, firstSettledAt }]) => ({
        requestId,
        collateralSettled: Number(formatUnits(collateral, decimals)),
        firstSettledAt,
      }))
    },
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
    staleTime: 30_000,
  })
