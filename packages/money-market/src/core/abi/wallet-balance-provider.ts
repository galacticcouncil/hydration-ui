/**
 * WalletBalanceProvider — a user's underlying balance per reserve.
 *
 * The on-chain function is `getUserWalletBalances`. `@aave/contract-helpers`
 * wraps it under the name `getUserWalletBalancesForLendingPoolProvider`; that is
 * a service-method name, not a contract one.
 *
 * Ported from `@aave/contract-helpers` 1.23.1 typechain factories. Internal to
 * core — never re-exported from a public entrypoint.
 */
export const walletBalanceProviderAbi = [
  {
    inputs: [
      {
        name: "provider",
        type: "address",
      },
      {
        name: "user",
        type: "address",
      },
    ],
    name: "getUserWalletBalances",
    outputs: [
      {
        name: "",
        type: "address[]",
      },
      {
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const
