import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { AnyUseQueryOptions } from "@tanstack/react-query"

// Ignores block changes
export const stableQuery = <TQueryOptions extends AnyUseQueryOptions>({
  queryKey,
  ...queryOptions
}: TQueryOptions): TQueryOptions => ({
  ...(queryOptions as TQueryOptions),
  queryKey: queryKey?.filter(
    (param: unknown) => param !== QUERY_KEY_BLOCK_PREFIX,
  ),
})
