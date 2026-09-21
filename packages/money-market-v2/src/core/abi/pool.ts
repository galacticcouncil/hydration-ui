/**
 * Pool — every state-changing call this package builds.
 *
 * Read-only Pool functions are deliberately absent: reserve and user state is read
 * through the UI data providers in one batched call instead.
 *
 * `swapBorrowRateMode` and the stable-rate functions are not declared. Stable-rate
 * borrowing is cut and is disabled on all four markets, so `borrow` and `repay`
 * are only ever called with the variable interest rate mode (`2`).
 *
 * Ported from `@aave/contract-helpers` 1.23.1 typechain factories. Internal to
 * core — never re-exported from a public entrypoint.
 */
export const poolAbi = [
  {
    inputs: [
      {
        name: "asset",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
      {
        name: "onBehalfOf",
        type: "address",
      },
      {
        name: "referralCode",
        type: "uint16",
      },
    ],
    name: "supply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        name: "asset",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
      {
        name: "to",
        type: "address",
      },
    ],
    name: "withdraw",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        name: "asset",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
      {
        name: "interestRateMode",
        type: "uint256",
      },
      {
        name: "referralCode",
        type: "uint16",
      },
      {
        name: "onBehalfOf",
        type: "address",
      },
    ],
    name: "borrow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        name: "asset",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
      {
        name: "interestRateMode",
        type: "uint256",
      },
      {
        name: "onBehalfOf",
        type: "address",
      },
    ],
    name: "repay",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        name: "asset",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
      {
        name: "interestRateMode",
        type: "uint256",
      },
    ],
    name: "repayWithATokens",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        name: "asset",
        type: "address",
      },
      {
        name: "useAsCollateral",
        type: "bool",
      },
    ],
    name: "setUserUseReserveAsCollateral",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        name: "categoryId",
        type: "uint8",
      },
    ],
    name: "setUserEMode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const
