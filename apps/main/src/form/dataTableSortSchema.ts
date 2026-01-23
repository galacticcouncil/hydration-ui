import z from "zod"

export const dataTableSortSchema = z
  .array(
    z.object({
      id: z.string(),
      desc: z.boolean(),
    }),
  )
  .default([])
