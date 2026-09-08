export const GAMMA_CONTRACTS = {
  hypervisor: "0xa206D0959813f17c17C87147271C49065438648A",
  hypervisorFactory: "0x1d652D8333F412c5e86360D3adc43E3F3C93E603",
  clearing: "0x3541A3E5Db2d611904BE4F45A3CAFEA9A4df3e48",
  uniProxy: "0x20aA5d9ffF339c3f1ACaee792aa05c53cEb3F741",
  admin: "0x8fc8a0d7cb9c6B2366Ec08f1Bf03067D54b67bc5",
  rebalanceProxy: "0x8B7Dd119b7edb85D9cF166129DBec5D88DC78C94",
} as const

export const BOOTSTRAP_V3_POOLS = [
  { token0: 1001, token1: 222, fee: 3000 },
] as const
