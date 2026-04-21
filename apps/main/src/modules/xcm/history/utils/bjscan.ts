import { HYDRATION_CHAIN_KEY, stringEquals } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { AnyChain, Asset } from "@galacticcouncil/xc-core"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { isNumber } from "remeda"
import z from "zod"

import { chainToUrn } from "@/modules/xcm/history/utils/optimistic"

export const basejumpScanEventSchema = z.object({
  chain: z.string(),
  txHash: z.string(),
  logIndex: z.number(),
  blockNumber: z.string(),
  blockTimestamp: z.number(),
})

export const basejumpScanItemSchema = z.object({
  id: z.string(),
  state: z.string(),
  source_asset: z.string().nullable(),
  source_chain: z.string().nullable(),
  dest_asset: z.string().nullable(),
  dest_chain: z.string().nullable(),
  dest_chain_id: z.number().nullable(),
  sender: z.string(),
  recipient: z.string(),
  gross_amount: z.string(),
  fee: z.string(),
  net_amount: z.string(),
  transfer_sequence: z.string(),
  message_sequence: z.string(),
  pending_id: z.unknown().nullable(),
  initiated: basejumpScanEventSchema.nullable(),
  completed: basejumpScanEventSchema.nullable(),
  fulfilled: basejumpScanEventSchema.nullable(),
  queued: basejumpScanEventSchema.nullable(),
  updated_at: z.string(),
})

export const basejumpScanSchema = z.object({
  items: z.array(basejumpScanItemSchema),
  total: z.number(),
})

export const basejumpSseEventSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("created"),
    transfer: basejumpScanItemSchema,
  }),
  z.object({
    kind: z.literal("updated"),
    transfer: basejumpScanItemSchema,
  }),
])

export type BasejumpScanEvent = z.infer<typeof basejumpScanEventSchema>
export type BasejumpScanItem = z.infer<typeof basejumpScanItemSchema>
export type BasejumpScan = z.infer<typeof basejumpScanSchema>
export type BasejumpSseEvent = z.infer<typeof basejumpSseEventSchema>

export function resolveChain(chainKey: string | null): AnyChain | undefined {
  if (!chainKey) return
  return chainsMap.get(chainKey)
}

export function resolveBasejumpAsset(
  chainKey: string | null,
  assetId: string | null,
): { asset: Asset; decimals: number; id: string } | undefined {
  if (!chainKey || !assetId) return undefined
  const chain = resolveChain(chainKey)
  if (!chain) return undefined

  const asset = Array.from(chain.assetsData.values()).find(
    (entry) => !!entry.id && stringEquals(entry.id.toString(), assetId),
  )

  if (!asset || !asset.id || !isNumber(asset.decimals)) return undefined
  return {
    asset: asset.asset,
    decimals: asset.decimals,
    id: asset.id.toString(),
  }
}

export function mapBasejumpState(state: string): string {
  return state === "completed" ? "received" : "sent"
}

export function parseBasejumpId(id: string): {
  correlationId: string
  id: number
} {
  const tail = id.split("-").at(-1)
  const parsed = Number(tail)
  return {
    correlationId: id,
    id: Number.isNaN(parsed) ? 0 : parsed,
  }
}

export function parseTimestamp(item: BasejumpScanItem): number {
  return (
    item?.initiated?.blockTimestamp ||
    item?.completed?.blockTimestamp ||
    Date.parse(item.updated_at)
  )
}

export function basejumpItemToXcJourney(
  item: BasejumpScanItem,
): XcJourney | undefined {
  const sourceChain = resolveChain(item.source_chain)
  const destChain = resolveChain(item.dest_chain || HYDRATION_CHAIN_KEY)
  if (!sourceChain || !destChain) return undefined

  const resolvedAsset = resolveBasejumpAsset(
    item.source_chain,
    item.source_asset,
  )
  if (!resolvedAsset) return undefined

  const originTxPrimary = item.initiated?.txHash
  if (!originTxPrimary) return undefined

  const { id, correlationId } = parseBasejumpId(item.id)
  const originUrn = chainToUrn(sourceChain)
  const destinationUrn = chainToUrn(destChain)
  const timestamp = parseTimestamp(item)

  return {
    id,
    correlationId,
    status: mapBasejumpState(item.state),
    type: "transfer",
    originProtocol: "basejump",
    destinationProtocol: "basejump",
    origin: originUrn,
    destination: destinationUrn,
    from: item.sender,
    fromFormatted: item.sender,
    to: item.recipient,
    toFormatted: item.recipient,
    sentAt: timestamp,
    createdAt: timestamp,
    recvAt: item.completed ? timestamp : undefined,
    stops: "",
    instructions: "",
    transactCalls: "",
    originTxPrimary,
    destinationTxPrimary: item.completed?.txHash,
    totalUsd: 0,
    assets: [
      {
        asset: `${originUrn}|${resolvedAsset.id}`,
        symbol: resolvedAsset.asset.originSymbol,
        amount: item.gross_amount,
        decimals: resolvedAsset.decimals,
        role: "transfer",
        sequence: 0,
      },
    ],
  } satisfies XcJourney
}
