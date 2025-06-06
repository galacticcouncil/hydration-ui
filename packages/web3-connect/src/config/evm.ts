export const EVM_DEFAULT_CHAIN_KEY = "hydration"
export const EVM_DISPATCH_ADDRESS = "0x0000000000000000000000000000000000000401"
export const EVM_CALL_PERMIT_ADDRESS =
  "0x000000000000000000000000000000000000080a"
export const EVM_CALL_PERMIT_ABI = [
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "bytes", name: "data", type: "bytes" },
      { internalType: "uint64", name: "gaslimit", type: "uint64" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
    ],
    name: "dispatch",
    outputs: [{ internalType: "bytes", name: "output", type: "bytes" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "nonces",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const

export const EVM_CALL_PERMIT_TYPES = {
  EIP712Domain: [
    {
      name: "name",
      type: "string",
    },
    {
      name: "version",
      type: "string",
    },
    {
      name: "chainId",
      type: "uint256",
    },
    {
      name: "verifyingContract",
      type: "address",
    },
  ],
  CallPermit: [
    {
      name: "from",
      type: "address",
    },
    {
      name: "to",
      type: "address",
    },
    {
      name: "value",
      type: "uint256",
    },
    {
      name: "data",
      type: "bytes",
    },
    {
      name: "gaslimit",
      type: "uint64",
    },
    {
      name: "nonce",
      type: "uint256",
    },
    {
      name: "deadline",
      type: "uint256",
    },
  ],
}
