/**
 * One Gamma deployment: a HypervisorFactory and the contracts its vaults use.
 *
 * A vault only accepts deposits from the UniProxy of its own stack (its
 * `whitelistedAddress`), so every per-vault read and write must use the stack
 * the vault was found in — never a global UniProxy.
 */
export type GammaStack = {
  readonly hypervisorFactory: `0x${string}`
  readonly clearing: `0x${string}`
  readonly uniProxy: `0x${string}`
  readonly admin: `0x${string}`
  readonly rebalanceProxy: `0x${string}`
}

/** Pool 1 - aDOT/HOLLar. */
const MAINNET_ADOT_STACK = {
  hypervisorFactory: "0x1d652D8333F412c5e86360D3adc43E3F3C93E603",
  clearing: "0x3541A3E5Db2d611904BE4F45A3CAFEA9A4df3e48",
  uniProxy: "0x20aA5d9ffF339c3f1ACaee792aa05c53cEb3F741",
  admin: "0x8fc8a0d7cb9c6B2366Ec08f1Bf03067D54b67bc5",
  rebalanceProxy: "0x8B7Dd119b7edb85D9cF166129DBec5D88DC78C94",
} as const satisfies GammaStack

/**
 * Pools 2-5 (atBTC, aPAXG, GETH, GSOL against HOLLAR)
 */
const MAINNET_CL2_STACK = {
  hypervisorFactory: "0x3e597A84A9eDaCb025B36A5B6E8a6b575cE8C5fA",
  clearing: "0x0AC8eD68C66B93a577EfDaC5aF596D8d5eeA9688",
  uniProxy: "0xA8E8bA5811397e739f3FC81A29228C03416E2c0E",
  admin: "0xdA75A8Cb7651516Ac459f629d181F614a62172Ad",
  rebalanceProxy: "0xbd1d6B85a62BFA41f9665626a61eA986CaFF19e8",
} as const satisfies GammaStack

/** Vault the EVM bootstrap reads its pool from when the runtime has no UniswapV3Factory. */
export const GAMMA_BOOTSTRAP_HYPERVISOR: `0x${string}` =
  "0xa206D0959813f17c17C87147271C49065438648A"

/** Every Gamma stack, searched in order for a pool's vault. */
export const GAMMA_STACKS: readonly GammaStack[] = [
  MAINNET_ADOT_STACK,
  MAINNET_CL2_STACK,
]
