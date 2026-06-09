import type { Hex } from "viem"

export const BIL_QUERY_KEY_PREFIX = "bil"

export const bilQueryKeys = {
  vaultContract: () => [BIL_QUERY_KEY_PREFIX, "vault-contract"],
  poolContract: () => [BIL_QUERY_KEY_PREFIX, "pool-contract"],
  vaultStats: () => [BIL_QUERY_KEY_PREFIX, "vault-stats"],
  vaultBalances: (evmAddress: Hex | undefined) => [
    BIL_QUERY_KEY_PREFIX,
    "vault-balances",
    evmAddress,
  ],
  vaultPreviewDeposit: (hollarAmount: number) => [
    BIL_QUERY_KEY_PREFIX,
    "vault-preview-deposit",
    hollarAmount,
  ],
  vaultPreviewRedeem: (bilAmount: number) => [
    BIL_QUERY_KEY_PREFIX,
    "vault-preview-redeem",
    bilAmount,
  ],
  vaultAutoclaim: (evmAddress: Hex | undefined) => [
    BIL_QUERY_KEY_PREFIX,
    "vault-autoclaim",
    evmAddress,
  ],
  vaultQueue: (evmAddress: Hex | undefined) => [
    BIL_QUERY_KEY_PREFIX,
    "vault-queue",
    evmAddress,
  ],
  vaultHistory: (evmAddress: Hex | undefined) => [
    BIL_QUERY_KEY_PREFIX,
    "vault-history",
    evmAddress,
  ],
  poolPosition: (evmAddress: Hex | undefined) => [
    BIL_QUERY_KEY_PREFIX,
    "pool-position",
    evmAddress,
  ],
  reserveConfig: () => [BIL_QUERY_KEY_PREFIX, "reserve-config"],
}
