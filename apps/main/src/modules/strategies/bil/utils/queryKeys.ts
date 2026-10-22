export const BIL_QUERY_KEY_PREFIX = "bil"

export const bilQueryKeys = {
  vaultContract: () => [BIL_QUERY_KEY_PREFIX, "vault-contract"],
  poolContract: () => [BIL_QUERY_KEY_PREFIX, "pool-contract"],
  vaultStats: () => [BIL_QUERY_KEY_PREFIX, "vault-stats"],
  vaultBalances: (evmAddress: string | undefined) => [
    BIL_QUERY_KEY_PREFIX,
    "vault-balances",
    evmAddress,
  ],
  vaultAutoclaim: (evmAddress: string | undefined) => [
    BIL_QUERY_KEY_PREFIX,
    "vault-autoclaim",
    evmAddress,
  ],
  vaultQueue: (evmAddress: string | undefined) => [
    BIL_QUERY_KEY_PREFIX,
    "vault-queue",
    evmAddress,
  ],
  poolPosition: (evmAddress: string | undefined) => [
    BIL_QUERY_KEY_PREFIX,
    "pool-position",
    evmAddress,
  ],
  reserveConfig: () => [BIL_QUERY_KEY_PREFIX, "reserve-config"],
}
