import { bigShift, getVaaHeader, stringEquals } from "@galacticcouncil/utils"
import { AnyChain, Ntt } from "@galacticcouncil/xc-core"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { isNumber } from "remeda"
import z from "zod"

import {
  findChainByWormholeId,
  resolveNttDeployment,
} from "@/modules/xcm/history/utils/claim"
import {
  getChainXcScanUrn,
  XcJourneyWhStop,
} from "@/modules/xcm/history/utils/journey"

export const wormholeOperationSchema = z.object({
  id: z.string(),
  vaa: z.object({
    raw: z.string(),
    guardianSetIndex: z.number(),
    isDuplicated: z.boolean(),
  }),
  sourceChain: z.object({
    timestamp: z.string(),
    transaction: z.object({
      txHash: z.string(),
    }),
  }),
  targetChain: z
    .object({
      timestamp: z.string().nullish(),
      transaction: z
        .object({
          txHash: z.string(),
        })
        .nullish(),
    })
    .nullish(),
  content: z.object({
    standarizedProperties: z.object({
      fromChain: z.number(),
      fromAddress: z.string(),
      toChain: z.number(),
      toAddress: z.string(),
      appIds: z.array(z.string()),
      amount: z.string(),
      tokenAddress: z.string(),
      tokenChain: z.number(),
      normalizedDecimals: z.number().nullish(),
    }),
  }),
})

export const wormholeOperationsSchema = z.object({
  operations: z.array(z.unknown()),
})

export type WormholeOperation = z.infer<typeof wormholeOperationSchema>

/** NTT trims amounts on the wire, WormholeScan reports them untouched. */
const NTT_TRIMMED_DECIMALS = 8

/**
 * Transferred token as registered in xc-cfg on the destination chain.
 *
 * Never taken off the API response: NTT trims amounts to 8 decimals on the
 * wire, so the response's decimals describe the wire format, not the token.
 */
function resolveNttAsset(journey: XcJourney, toChain: AnyChain) {
  const ntt = resolveNttDeployment(journey, toChain)
  if (!ntt) return undefined

  const entry = Array.from(toChain.assetsData.values()).find((data) => {
    const def = Ntt.find(toChain, data.asset.key)
    return !!def && stringEquals(def.token, ntt.token)
  })

  if (!entry?.id || !isNumber(entry.decimals)) return undefined

  return {
    id: entry.id.toString(),
    symbol: entry.asset.originSymbol,
    decimals: entry.decimals,
  }
}

export function wormholeOpToXcJourney(op: unknown): XcJourney | undefined {
  const parsed = wormholeOperationSchema.safeParse(op)
  if (!parsed.success) return undefined

  const { id, vaa, sourceChain, targetChain, content } = parsed.data
  const props = content.standarizedProperties

  const header = safeVaaHeader(vaa.raw)
  if (!header) return undefined

  const originChain = findChainByWormholeId(props.fromChain)
  const destChain = findChainByWormholeId(props.toChain)
  if (!originChain || !destChain || header.emitterChain !== props.fromChain) {
    return undefined
  }

  const originUrn = getChainXcScanUrn(originChain)
  const destinationUrn = getChainXcScanUrn(destChain)
  const sentAt = Date.parse(sourceChain.timestamp)
  if (Number.isNaN(sentAt)) return undefined
  const receivedAt = targetChain?.timestamp
    ? Date.parse(targetChain.timestamp)
    : undefined
  const recvAt =
    receivedAt === undefined || Number.isNaN(receivedAt)
      ? undefined
      : receivedAt

  // getJourneyVaaRaw parses this back out to reach the VAA, so it has to
  // round-trip - unlike basejump journeys, which carry no stops at all.
  const stop: XcJourneyWhStop = {
    type: "wormhole",
    from: {},
    to: {},
    instructions: {
      type: "WormholeVAA",
      value: {
        raw: vaa.raw,
        guardianSetIndex: vaa.guardianSetIndex,
        isDuplicated: vaa.isDuplicated,
      },
    },
  }

  const journey = {
    id: 0,
    correlationId: id,
    status: targetChain ? "received" : "waiting",
    type: "transfer",
    originProtocol: "wormhole",
    destinationProtocol: "wormhole",
    origin: originUrn,
    destination: destinationUrn,
    from: props.fromAddress,
    fromFormatted: props.fromAddress,
    to: props.toAddress,
    toFormatted: props.toAddress,
    sentAt,
    createdAt: sentAt,
    recvAt,
    stops: JSON.stringify([stop]),
    instructions: "",
    transactCalls: "",
    originTxPrimary: sourceChain.transaction.txHash,
    destinationTxPrimary: targetChain?.transaction?.txHash,
    totalUsd: 0,
    assets: [],
  } satisfies XcJourney

  const asset = resolveNttAsset(journey, destChain)
  if (!asset) return undefined

  const trimmedDecimals = props.normalizedDecimals ?? NTT_TRIMMED_DECIMALS

  return {
    ...journey,
    assets: [
      {
        asset: `${destinationUrn}|${asset.id}`,
        symbol: asset.symbol,
        amount: bigShift(
          props.amount,
          asset.decimals - trimmedDecimals,
        ).toFixed(0),
        decimals: asset.decimals,
        role: "transfer",
        sequence: 0,
      },
    ],
  }
}

function safeVaaHeader(vaaRaw: string) {
  try {
    return getVaaHeader(vaaRaw)
  } catch {
    return undefined
  }
}
