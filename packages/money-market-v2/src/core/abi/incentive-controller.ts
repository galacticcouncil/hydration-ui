/**
 * IncentivesController — where a claim is sent.
 *
 * Only the two claim functions are declared. The controller address is never
 * taken from the market descriptor; it arrives on the reward payload, which is
 * why no read here is needed to find it.
 *
 * The `OnBehalf` and `ToSelf` variants are deliberately left out: v2 always
 * names a recipient explicitly, so `claimRewards` and `claimAllRewards` cover
 * both the self and the third-party case.
 *
 * Ported from `@aave/contract-helpers` 1.23.1 typechain factories. Internal to
 * core — never re-exported from a public entrypoint.
 */
export const incentiveControllerAbi = [
  {
    inputs: [
      {
        name: "assets",
        type: "address[]",
      },
      {
        name: "to",
        type: "address",
      },
    ],
    name: "claimAllRewards",
    outputs: [
      {
        name: "rewardsList",
        type: "address[]",
      },
      {
        name: "claimedAmounts",
        type: "uint256[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        name: "assets",
        type: "address[]",
      },
      {
        name: "amount",
        type: "uint256",
      },
      {
        name: "to",
        type: "address",
      },
      {
        name: "reward",
        type: "address",
      },
    ],
    name: "claimRewards",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const
