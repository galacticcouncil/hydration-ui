import { wormholescan } from "@galacticcouncil/utils"
import { queryOptions } from "@tanstack/react-query"
import z from "zod/v4"

const vaaSchema = z.object({
  data: z.object({
    /** Base64. */
    vaa: z.string(),
    guardianSetIndex: z.number(),
    isDuplicated: z.boolean().optional(),
  }),
})

export type WormholeVaa = z.infer<typeof vaaSchema>["data"]

/** A vaa by its `<chain>/<emitter>/<sequence>`; null until it is signed. */
export const wormholeVaaQuery = (vaaId: string) =>
  queryOptions({
    queryKey: ["wormholescan", "vaa", vaaId],
    queryFn: async (): Promise<WormholeVaa | null> => {
      const res = await fetch(wormholescan.api(`vaas/${vaaId}`), {
        signal: AbortSignal.timeout(10_000),
      })
      if (res.status === 404) return null
      if (!res.ok) {
        throw new Error(
          `Wormholescan API error: ${res.status} ${res.statusText}`,
        )
      }

      const body: unknown = await res.json()
      return vaaSchema.parse(body).data
    },
    // A signed vaa never changes; an unsigned one is asked for again
    staleTime: ({ state }) => (state.data ? Infinity : 0),
  })
