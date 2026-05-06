import { createPublicClient, type Hex, http } from "viem"

export const VAULT_ADDRESS: Hex = "0x4360067b4Ee1C89449bBa7AE6b60940D8562aa35"
export const HOLLAR_ADDRESS: Hex = "0x531a654d1696ED52e7275A8cede955E82620f99a"

export const EVM_CALL_GAS = 5_000_000n

// Dedicated HTTP viem client for vault EVM reads.
// The app's papi custom transport (WebSocket) returns empty data for eth_call
// to contracts deployed on the Lark fork, so we use a direct HTTP transport.
const rpcUrl =
  import.meta.env.VITE_PROVIDER_URL?.replace("wss://", "https://").replace(
    "ws://",
    "http://",
  ) || "https://2.lark.hydration.cloud"

export const vaultEvmClient = createPublicClient({
  transport: http(rpcUrl),
})

export const VAULT_ABI = [
  // Read functions
  {
    type: "function",
    name: "totalAssets",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "exchangeRate",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdrawalDelay",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "minRedeemAmount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAPYWad",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRedemptionQueuePending",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "queueTail",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tvlCap",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "paused",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "depositsPaused",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "minReinvestAmount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  // Positions
  {
    type: "function",
    name: "getPositionCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPositionHead",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPosition",
    inputs: [{ name: "positionIndex", type: "uint256" }],
    outputs: [
      { name: "tokenId", type: "uint256" },
      { name: "principal", type: "uint256" },
      { name: "apyWad", type: "uint256" },
      { name: "depositTime", type: "uint256" },
      { name: "maturityTime", type: "uint256" },
      { name: "state", type: "uint8" },
    ],
    stateMutability: "view",
  },
  // Redemption queue
  {
    type: "function",
    name: "getRedemptionQueueLength",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getQueueHead",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRedemptionRequest",
    inputs: [{ name: "requestId", type: "uint256" }],
    outputs: [
      { name: "user", type: "address" },
      { name: "hdclAmount", type: "uint256" },
      { name: "hdclFulfilled", type: "uint256" },
      { name: "active", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTotalQueuedHdcl",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getIdleHollar",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getEstimatedWaitTime",
    inputs: [{ name: "requestId", type: "uint256" }],
    outputs: [{ name: "estimatedSeconds", type: "uint256" }],
    stateMutability: "view",
  },
  // Preview
  {
    type: "function",
    name: "previewDeposit",
    inputs: [{ name: "hollarAmount", type: "uint256" }],
    outputs: [{ name: "hdclAmount", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "previewRedeem",
    inputs: [{ name: "hdclAmount", type: "uint256" }],
    outputs: [{ name: "hollarAmount", type: "uint256" }],
    stateMutability: "view",
  },
  // APY
  {
    type: "function",
    name: "getActiveAPYCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getActiveAPY",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  // Write functions
  {
    type: "function",
    name: "deposit",
    inputs: [{ name: "hollarAmount", type: "uint256" }],
    outputs: [{ name: "hdclMinted", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "requestRedeem",
    inputs: [{ name: "hdclAmount", type: "uint256" }],
    outputs: [{ name: "requestId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "cancelRedeem",
    inputs: [{ name: "requestId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const

export const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const
