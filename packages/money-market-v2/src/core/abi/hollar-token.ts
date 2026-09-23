/**
 * Hollar token (a GhoToken fork) — only `getFacilitatorBucket`, which is what
 * caps Hollar borrowing in a market (the pool's own borrow cap on the Hollar
 * reserve is unset). Each market's facilitator is its Hollar aToken.
 *
 * Internal to core — never re-exported from a public entrypoint.
 */
export const hollarTokenAbi = [
  {
    inputs: [{ name: "facilitator", type: "address" }],
    name: "getFacilitatorBucket",
    outputs: [
      { name: "bucketCapacity", type: "uint256" },
      { name: "bucketLevel", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const
