export const PROPELLER_QUERY_KEY_PREFIX = "propeller"

const vault = (vaultAddress: string) => [
  PROPELLER_QUERY_KEY_PREFIX,
  "vault",
  vaultAddress,
]

export const propellerQueryKeys = {
  subLoop: () => [PROPELLER_QUERY_KEY_PREFIX, "subloop"],
  claim: () => [PROPELLER_QUERY_KEY_PREFIX, "claim"],
  vault,
  vaultStats: (vaultAddress: string) => [...vault(vaultAddress), "stats"],
  vaultLoopPosition: (vaultAddress: string) => [
    ...vault(vaultAddress),
    "loop-position",
  ],
  vaultSettlements: (
    vaultAddress: string,
    minRequestId: number | undefined,
  ) => [...vault(vaultAddress), "settlements", minRequestId],
  vaultBalances: (vaultAddress: string, evmAddress: string | undefined) => [
    ...vault(vaultAddress),
    "balances",
    evmAddress,
  ],
  vaultQueue: (vaultAddress: string, evmAddress: string | undefined) => [
    ...vault(vaultAddress),
    "queue",
    evmAddress,
  ],
}
