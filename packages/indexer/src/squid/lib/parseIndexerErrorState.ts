import { z } from "zod"

const schema = z.object({
  kind: z.string(),
  error: z.string(),
  index: z.number(),
})

export type IndexerErrorState = z.infer<typeof schema>

export const parseIndexerErrorState = (
  errorState: unknown,
): IndexerErrorState | null => {
  const parsedErrorState = schema.safeParse(errorState)

  return parsedErrorState.success ? parsedErrorState.data : null
}
