import { getSquidSdk } from "@galacticcouncil/indexer/squid"
import {
  DataProviderStatus,
  DataProviderStatusThreshold,
  getDataProviderStatus,
  logger,
} from "@galacticcouncil/utils"

import { IndexerProps } from "@/config/rpc"

type IndexerInfo = {
  config: IndexerProps
  isMaster: boolean
  blockHeight: number | null
  blockDiff: number | null
  latency: number | null
  status: DataProviderStatus
}

const INDEXER_STATUS_THRESHOLDS: DataProviderStatusThreshold[] = [
  { max: 10, status: DataProviderStatus.HEALTHY },
  { max: 50, status: DataProviderStatus.LAGGING },
  { max: Infinity, status: DataProviderStatus.DEGRADED },
]

export async function fetchIndexerInfo(
  indexer: IndexerProps,
): Promise<IndexerInfo> {
  const start = performance.now()

  const [metadataResult, blockHeightResult] = await Promise.allSettled([
    fetch(indexer.metadataUrl).then((r) => {
      if (!r.ok) throw new Error("Metadata fetch failed")
      return r.json()
    }),
    getSquidSdk(indexer.graphqlUrl)
      .LatestBlockHeightQuery()
      .then((r) => r.blocks?.edges?.[0]?.node?.height ?? null),
  ])

  const isValidResponse =
    metadataResult.status === "fulfilled" &&
    blockHeightResult.status === "fulfilled"

  const end = performance.now()
  const latency = isValidResponse ? end - start : null

  const isMaster = isValidResponse
    ? (metadataResult.value?.indexer?.master ?? false)
    : false

  const blockHeight = isValidResponse ? blockHeightResult.value : null

  return {
    config: indexer,
    isMaster,
    blockHeight,
    blockDiff: null,
    latency,
    status: DataProviderStatus.OFFLINE,
  }
}

export function getIndexerStatus(
  blockHeight: number | null,
  referenceBlock: number | null,
): Pick<IndexerInfo, "status" | "blockDiff"> {
  if (referenceBlock === null || blockHeight === null)
    return { status: DataProviderStatus.OFFLINE, blockDiff: null }

  const blockDiff = referenceBlock - blockHeight
  const status = getDataProviderStatus(blockDiff, INDEXER_STATUS_THRESHOLDS)
  return { status, blockDiff }
}

function classifyIndexers(
  infos: IndexerInfo[],
  referenceBlock: number | null,
): IndexerInfo[] {
  return infos.map((info) => {
    const { status, blockDiff } = getIndexerStatus(
      info.blockHeight,
      referenceBlock,
    )
    return { ...info, status, blockDiff }
  })
}

function pickBestCandidate(candidates: IndexerInfo[]): IndexerInfo | null {
  if (candidates.length === 0) return null

  return candidates.reduce((best, current) => {
    const bestBlock = best.blockHeight ?? -Infinity
    const currentBlock = current.blockHeight ?? -Infinity

    if (currentBlock > bestBlock) return current
    if (currentBlock < bestBlock) return best

    const bestLatency = best.latency ?? Infinity
    const currentLatency = current.latency ?? Infinity

    return currentLatency < bestLatency ? current : best
  })
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

const indexerInfoToDebugFormat = ({ config, ...indexer }: IndexerInfo) => ({
  name: config.name,
  ...indexer,
  latency: indexer.latency ? indexer.latency.toFixed(2) : null,
  status: `${getStatusIcon(indexer.status)} ${indexer.status.toUpperCase()}`,
})

export function getBestIndexer(
  infos: IndexerInfo[],
  referenceBlock: number | null,
): IndexerInfo | null {
  const classified = classifyIndexers(infos, referenceBlock)

  logger.table(classified.map(indexerInfoToDebugFormat))

  // Pick the best healthy master
  const healthyMasterPool = classified.filter(
    (info) => info.isMaster && info.status === DataProviderStatus.HEALTHY,
  )

  if (healthyMasterPool.length > 0) {
    return pickBestCandidate(healthyMasterPool)
  }

  // Fallback 1: non-masters
  const nonMasterPool = classified.filter((info) => !info.isMaster)
  if (nonMasterPool.length > 0) {
    return pickBestCandidate(nonMasterPool)
  }

  // Fallback 2: any non-offline
  const anyAvailable = classified.filter(
    (info) => info.status !== DataProviderStatus.OFFLINE,
  )

  return pickBestCandidate(anyAvailable)
}
