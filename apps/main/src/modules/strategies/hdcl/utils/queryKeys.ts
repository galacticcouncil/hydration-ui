import type { Hex } from "viem"

export const HDCL_QUERY_KEY_PREFIX = "hdcl"

export const hdclQueryKeys = {
  vaultContract: () => [HDCL_QUERY_KEY_PREFIX, "vault-contract"],
  poolContract: () => [HDCL_QUERY_KEY_PREFIX, "pool-contract"],
  vaultStats: () => [HDCL_QUERY_KEY_PREFIX, "vault-stats"],
  vaultBalances: (evmAddress: Hex | undefined) => [
    HDCL_QUERY_KEY_PREFIX,
    "vault-balances",
    evmAddress,
  ],
  vaultPreviewDeposit: (hollarAmount: number) => [
    HDCL_QUERY_KEY_PREFIX,
    "vault-preview-deposit",
    hollarAmount,
  ],
  vaultPreviewRedeem: (hdclAmount: number) => [
    HDCL_QUERY_KEY_PREFIX,
    "vault-preview-redeem",
    hdclAmount,
  ],
  vaultAutoclaim: (evmAddress: Hex | undefined) => [
    HDCL_QUERY_KEY_PREFIX,
    "vault-autoclaim",
    evmAddress,
  ],
  vaultQueue: (evmAddress: Hex | undefined) => [
    HDCL_QUERY_KEY_PREFIX,
    "vault-queue",
    evmAddress,
  ],
  vaultHistory: (evmAddress: Hex | undefined) => [
    HDCL_QUERY_KEY_PREFIX,
    "vault-history",
    evmAddress,
  ],
  poolPosition: (evmAddress: Hex | undefined) => [
    HDCL_QUERY_KEY_PREFIX,
    "pool-position",
    evmAddress,
  ],
  reserveConfig: () => [HDCL_QUERY_KEY_PREFIX, "reserve-config"],
}
