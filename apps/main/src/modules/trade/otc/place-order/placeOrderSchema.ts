import * as z from "zod"

export const placeOrderSchema = z.object({
  offerAssetId: z.string(),
  offerAmount: z.string(),
  buyAssetId: z.string(),
  buyAmount: z.string(),
})

export type PlaceOrderFormValues = z.infer<typeof placeOrderSchema>
