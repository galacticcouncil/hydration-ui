import type { Mutation, Query } from "@tanstack/react-query"

/**
 * First key segments whose queries and mutations hold data or variables that
 * must never be logged ("hbr": bearer links, session tokens, bank details,
 * deposit instructions). The check reads the key the query or mutation is
 * stored under, so it holds for every fetch, prefetch or setQueryData of such
 * a key, with or without a factory. A mutation is covered only when it has a
 * `mutationKey` under one of these roots; one without a key logs as before.
 * The same roots are kept out of the portfolio persister (api/portfolio/persistence.ts).
 */
export const SENSITIVE_KEY_ROOTS: ReadonlySet<string> = new Set(["hbr"])

export const isSensitiveKey = (key: readonly unknown[] | undefined) =>
  typeof key?.[0] === "string" && SENSITIVE_KEY_ROOTS.has(key[0])

// For a sensitive key the error is logged as its name and message only, never
// its own fields (an HbrApiError carries the server's answer body).
const errorSummary = (error: unknown) =>
  error instanceof Error
    ? `${error.name}: ${error.message}`
    : "non-Error thrown"

/** QueryCache onError: a sensitive query logs its key and error only. */
export const logQueryError = (
  error: unknown,
  query: Query<unknown, unknown, unknown, readonly unknown[]>,
) => {
  if (isSensitiveKey(query.queryKey)) {
    console.error("[RQ]", errorSummary(error), { queryKey: query.queryKey })
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
  const mutationKey = mutation.options.mutationKey
  if (isSensitiveKey(mutationKey)) {
    console.error("[RQ]", errorSummary(error), { mutationKey })
    return
  }
  console.error("[RQ]", error, variables)
}
