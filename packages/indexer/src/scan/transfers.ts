import { queryOptions } from "@tanstack/react-query"
import z from "zod/v4"

import { isScanNotFound, ScanClient } from "."

const scanTransferSchema = z.object({
  /** `<kind>:<rail id>`, e.g. `ntt:<digest>` or `utxo:hydration:<extrinsic>`. */
  id: z.string(),
  /** The rail it moves over: ntt, utxo or basejump. */
  kind: z.string(),
  /** transfer, deposit, withdraw, intent or basejump. */
  type: z.string(),
  /** ms epoch */
  time: z.number(),
  /** The scan's chain name: hydration, ethereum, near, zcash, … */
  from_chain: z.string(),
  /** On hydration, the account's evm address. */
  from_address: z.string(),
  to_chain: z.string(),
  to_address: z.string(),
  symbol: z.string(),
  decimals: z.number().nullable(),
  /** In `decimals`, as the rail carries it. */
  amount: z.string(),
  fee: z.string().nullable(),
  /** pending, held, completed or failed. */
  status: z.string(),
  /** The rail's own state, e.g. `published` or `redeemed`. */
  stage: z.string(),
})

const scanTransfersSchema = z.object({
  items: z.array(scanTransferSchema),
  total: z.number(),
})

const scanTransferDetailSchema = z.object({
  view: scanTransferSchema,
  /** The rail's row behind the transfer, only the fields read here. */
  record: z.object({
    state: z.string().nullish(),
    /** The ntt leg's `<chain>/<emitter>/<sequence>`, if there is one. */
    vaa_id: z.string().nullish(),
    /** State of a utxo transfer's ntt leg. */
    rail_state: z.string().nullish(),
  }),
})

/** A transfer as the scan lists it, whatever its rail. */
export type ScanTransfer = z.infer<typeof scanTransferSchema>

export type ScanTransfersFilter = {
  /** An address or an origin tx hash, matched on either end. */
  readonly q?: string
  /** Scan chain names, any of which the transfer leaves. */
  readonly from?: readonly string[]
  /** Scan chain names, any of which the transfer reaches. */
  readonly to?: readonly string[]
  readonly type?: string
  readonly status?: string
  readonly limit?: number
  readonly offset?: number
}

export const scanTransfersQuery = (
  client: ScanClient,
  filter: ScanTransfersFilter,
) =>
  queryOptions({
    queryKey: ["scan", "transfers", filter],
    queryFn: () =>
      client.get("/api/transfers", scanTransfersSchema, {
        ...filter,
        from: filter.from?.join(","),
        to: filter.to?.join(","),
      }),
  })

export const scanTransferQuery = (client: ScanClient, id: string) =>
  queryOptions({
    queryKey: ["scan", "transfer", id],
    queryFn: async () => {
      try {
        return await client.get(
          `/api/transfers/${encodeURIComponent(id)}`,
          scanTransferDetailSchema,
        )
      } catch (error) {
        if (isScanNotFound(error)) return null
        throw error
      }
    },
  })
