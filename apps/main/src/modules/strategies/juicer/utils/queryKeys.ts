export const JUICER_QUERY_KEY_PREFIX = "juicer"

const vault = (vaultAddress: string) => [
  JUICER_QUERY_KEY_PREFIX,
  "vault",
  vaultAddress,
]

export const juicerQueryKeys = {
  subLoop: () => [JUICER_QUERY_KEY_PREFIX, "subloop"],
  exitBacklog: () => [JUICER_QUERY_KEY_PREFIX, "exit-backlog"],
  claimSurplus: () => [JUICER_QUERY_KEY_PREFIX, "claim-surplus"],
  claim: () => [JUICER_QUERY_KEY_PREFIX, "claim"],
  vault,
  vaultStats: (vaultAddress: string) => [...vault(vaultAddress), "stats"],
  baseRate: (vaultAddress: string) => [...vault(vaultAddress), "base-rate"],
  baseRateAt: (vaultAddress: string, blockNumber: bigint) => [
    ...vault(vaultAddress),
    "base-rate",
    blockNumber.toString(),
  ],
  depositCapacity: (vaultAddress: string) => [
    ...vault(vaultAddress),
    "deposit-capacity",
  ],
  vaultLoopPosition: (vaultAddress: string) => [
    ...vault(vaultAddress),
    "loop-position",
  ],
  exitHeadroom: (vaultAddress: string) => [
    ...vault(vaultAddress),
    "exit-headroom",
  ],
  vaultSettlePace: (vaultAddress: string) => [
    ...vault(vaultAddress),
    "settle-pace",
  ],
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
  claimPreview: (
    vaultAddress: string,
    requestId: number,
    evmAddress: string,
  ) => [...vault(vaultAddress), "claim-preview", requestId, evmAddress],
}
