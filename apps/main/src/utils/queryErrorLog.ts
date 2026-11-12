import type { Mutation, Query } from "@tanstack/react-query"

/**
 * First key segments whose queries and mutations hold data or variables that
 * must never be logged ("hbr": bearer links, session tokens, bank details,
 * deposit instructions). The check reads the key the query or mutation is
 * stored under, so it holds for every fetch, prefetch or setQueryData of such
 * a key, with or without a factory. A mutation is covered only when it has a
 * `mutationKey` under one of these roots; one without a key logs as before.
 */
export const SENSITIVE_KEY_ROOTS: ReadonlySet<string> = new Set(["hbr"])

const isSensitiveKey = (key: readonly unknown[] | undefined) =>
  typeof key?.[0] === "string" && SENSITIVE_KEY_ROOTS.has(key[0])

/** QueryCache onError: a sensitive query logs its key and error only. */
export const logQueryError = (
  error: unknown,
  query: Query<unknown, unknown, unknown, readonly unknown[]>,
) => {
  if (isSensitiveKey(query.queryKey)) {
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
  const mutationKey = mutation.options.mutationKey
  if (isSensitiveKey(mutationKey)) {
    console.error("[RQ]", error, { mutationKey })
    return
  }
  console.error("[RQ]", error, variables)
}
