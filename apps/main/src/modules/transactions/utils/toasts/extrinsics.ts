import { Extrinsic } from "@galacticcouncil/indexer/neckwork"

export type ExtrinsicResolution =
  | { processed: false }
  | {
      processed: true
      status: "success" | "error" | "unknown"
      dateUpdated: string
      blockHeight: number
      extrinsicIndex: number
    }

export const resolveExtrinsic = (
  extrinsic: Extrinsic | null,
): ExtrinsicResolution => {
  if (!extrinsic) return { processed: false }

  const status = (() => {
    if (extrinsic.success) return "success"
    if (extrinsic.error) return "error"
    return "unknown"
  })()

  return {
    processed: true,
    status,
    dateUpdated: extrinsic.timestamp,
    blockHeight: extrinsic.blockHeight,
    extrinsicIndex: extrinsic.extrinsicIndex,
  }
}
