import { z } from "zod/v4"

export const xcmQueryParamsSchema = z.object({
  srcChain: z.string().optional(),
  srcAsset: z.string().optional(),
  destChain: z.string().optional(),
  destAsset: z.string().optional(),
})

export type XcmQueryParams = z.infer<typeof xcmQueryParamsSchema>
