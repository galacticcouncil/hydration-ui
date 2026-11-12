import type { Mutation, Query } from "@tanstack/react-query"

/**
 * react-query `meta` for a query or mutation whose data or variables must
 * never be logged (bearer links, session tokens, bank details). The flag
 * travels with the query or mutation itself, so the global error log below
 * cannot miss it the way a key-prefix convention could (mutations have no
 * key).
 */
export const SENSITIVE_QUERY_META = { sensitive: true } as const

const isSensitive = (meta: Record<string, unknown> | undefined) =>
  meta?.sensitive === true

/** QueryCache onError: a sensitive query logs its key and error only. */
export const logQueryError = (
  error: unknown,
  query: Query<unknown, unknown, unknown, readonly unknown[]>,
) => {
  if (isSensitive(query.meta)) {
    console.error("[RQ]", error, { queryKey: query.queryKey })
    return
  }
  console.error("[RQ]", error, query)
}

/** MutationCache onError: a sensitive mutation logs its key and error only, never its variables. */
export const logMutationError = (
  error: unknown,
  variables: unknown,
  _onMutateResult: unknown,
  mutation: Mutation<unknown, unknown, unknown>,
) => {
  if (isSensitive(mutation.options.meta)) {
    console.error("[RQ]", error, { mutationKey: mutation.options.mutationKey })
    return
  }
  console.error("[RQ]", error, variables)
}
