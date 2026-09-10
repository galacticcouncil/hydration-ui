import { NeckworkStatus } from "@galacticcouncil/indexer/neckwork"
import {
  DataProviderStatus,
  DataProviderStatusThreshold,
  getDataProviderStatus,
  logger,
  PingResponse,
} from "@galacticcouncil/utils"
import { first } from "remeda"

import { ENV } from "@/config/env"
import { NeckworkProbe } from "@/states/neckwork"

const RPC_PING_STATUS_THRESHOLDS: DataProviderStatusThreshold[] = [
  { max: 250, status: DataProviderStatus.HEALTHY },
  { max: 500, status: DataProviderStatus.LAGGING },
  { max: Infinity, status: DataProviderStatus.DEGRADED },
]

const INDEXER_STATUS_THRESHOLDS: DataProviderStatusThreshold[] = [
  { max: 25, status: DataProviderStatus.HEALTHY },
  { max: 100, status: DataProviderStatus.LAGGING },
  { max: Infinity, status: DataProviderStatus.DEGRADED },
]

const INDEXER_TIMEOUT_MS = 2000

export async function fetchNeckworkStatus(): Promise<NeckworkProbe> {
  try {
    const response = await fetch(`${ENV.VITE_NECKWORK_URL}/v1/status`, {
      signal: AbortSignal.timeout(INDEXER_TIMEOUT_MS),
    })

    if (!response.ok) return { kind: "http", statusCode: response.status }

    return { kind: "ok", status: (await response.json()) as NeckworkStatus }
  } catch (error) {
    const isTimeout =
      error instanceof DOMException && error.name === "TimeoutError"

    return isTimeout ? { kind: "timeout" } : { kind: "network" }
  }
}

export function getIndexerStatus(
  blockHeight: number | null,
  referenceBlock: number | null,
): { status: DataProviderStatus; blockDiff: number | null } {
  if (blockHeight === null)
    return { status: DataProviderStatus.OFFLINE, blockDiff: null }

  if (referenceBlock === null)
    return { status: DataProviderStatus.HEALTHY, blockDiff: 0 }

  const blockDiff = referenceBlock - blockHeight
  const status = getDataProviderStatus(blockDiff, INDEXER_STATUS_THRESHOLDS)
  return { status, blockDiff }
}

const getStatusIcon = (status: DataProviderStatus) => {
  switch (status) {
    case DataProviderStatus.HEALTHY:
      return "🟢"
    case DataProviderStatus.LAGGING:
      return "🟡"
    case DataProviderStatus.DEGRADED:
      return "🔴"
    case DataProviderStatus.OFFLINE:
      return "❌"
  }
}

const getRpcStatus = (rpc: PingResponse): DataProviderStatus => {
  if (rpc.ping === Infinity || rpc.blockNumber === null) {
    return DataProviderStatus.OFFLINE
  }

  return getDataProviderStatus(rpc.ping, RPC_PING_STATUS_THRESHOLDS)
}

const rpcInfoToDebugFormat = (rpc: PingResponse) => {
  const status = getRpcStatus(rpc)

  return {
    url: rpc.url,
    blockNumber: rpc.blockNumber,
    ping: rpc.ping && rpc.ping !== Infinity ? rpc.ping.toFixed(2) : null,
    status: `${getStatusIcon(status)} ${status.toUpperCase()}`,
  }
}

export function getBestRpc(rpcs: PingResponse[]): PingResponse | null {
  logger.table(rpcs.map(rpcInfoToDebugFormat))
  return first(rpcs) ?? null
}
