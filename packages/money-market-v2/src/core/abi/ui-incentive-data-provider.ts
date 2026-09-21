/**
 * UiIncentiveDataProviderV3 — reward emissions per reserve and per user.
 *
 * Each reward carries its own incentive controller address and price feed, which
 * is why the claim builder takes the controller from the payload rather than from
 * the market descriptor.
 *
 * Ported from `@aave/contract-helpers` 1.23.1 typechain factories. Internal to
 * core — never re-exported from a public entrypoint.
 */
export const uiIncentiveDataProviderAbi = [
  {
    inputs: [
      {
        name: "provider",
        type: "address",
      },
    ],
    name: "getReservesIncentivesData",
    outputs: [
      {
        components: [
          {
            name: "underlyingAsset",
            type: "address",
          },
          {
            components: [
              {
                name: "tokenAddress",
                type: "address",
              },
              {
                name: "incentiveControllerAddress",
                type: "address",
              },
              {
                components: [
                  {
                    name: "rewardTokenSymbol",
                    type: "string",
                  },
                  {
                    name: "rewardTokenAddress",
                    type: "address",
                  },
                  {
                    name: "rewardOracleAddress",
                    type: "address",
                  },
                  {
                    name: "emissionPerSecond",
                    type: "uint256",
                  },
                  {
                    name: "incentivesLastUpdateTimestamp",
                    type: "uint256",
                  },
                  {
                    name: "tokenIncentivesIndex",
                    type: "uint256",
                  },
                  {
                    name: "emissionEndTimestamp",
                    type: "uint256",
                  },
                  {
                    name: "rewardPriceFeed",
                    type: "int256",
                  },
                  {
                    name: "rewardTokenDecimals",
                    type: "uint8",
                  },
                  {
                    name: "precision",
                    type: "uint8",
                  },
                  {
                    name: "priceFeedDecimals",
                    type: "uint8",
                  },
                ],
                name: "rewardsTokenInformation",
                type: "tuple[]",
              },
            ],
            name: "aIncentiveData",
            type: "tuple",
          },
          {
            components: [
              {
                name: "tokenAddress",
                type: "address",
              },
              {
                name: "incentiveControllerAddress",
                type: "address",
              },
              {
                components: [
                  {
                    name: "rewardTokenSymbol",
                    type: "string",
                  },
                  {
                    name: "rewardTokenAddress",
                    type: "address",
                  },
                  {
                    name: "rewardOracleAddress",
                    type: "address",
                  },
                  {
                    name: "emissionPerSecond",
                    type: "uint256",
                  },
                  {
                    name: "incentivesLastUpdateTimestamp",
                    type: "uint256",
                  },
                  {
                    name: "tokenIncentivesIndex",
                    type: "uint256",
                  },
                  {
                    name: "emissionEndTimestamp",
                    type: "uint256",
                  },
                  {
                    name: "rewardPriceFeed",
                    type: "int256",
                  },
                  {
                    name: "rewardTokenDecimals",
                    type: "uint8",
                  },
                  {
                    name: "precision",
                    type: "uint8",
                  },
                  {
                    name: "priceFeedDecimals",
                    type: "uint8",
                  },
                ],
                name: "rewardsTokenInformation",
                type: "tuple[]",
              },
            ],
            name: "vIncentiveData",
            type: "tuple",
          },
          {
            components: [
              {
                name: "tokenAddress",
                type: "address",
              },
              {
                name: "incentiveControllerAddress",
                type: "address",
              },
              {
                components: [
                  {
                    name: "rewardTokenSymbol",
                    type: "string",
                  },
                  {
                    name: "rewardTokenAddress",
                    type: "address",
                  },
                  {
                    name: "rewardOracleAddress",
                    type: "address",
                  },
                  {
                    name: "emissionPerSecond",
                    type: "uint256",
                  },
                  {
                    name: "incentivesLastUpdateTimestamp",
                    type: "uint256",
                  },
                  {
                    name: "tokenIncentivesIndex",
                    type: "uint256",
                  },
                  {
                    name: "emissionEndTimestamp",
                    type: "uint256",
                  },
                  {
                    name: "rewardPriceFeed",
                    type: "int256",
                  },
                  {
                    name: "rewardTokenDecimals",
                    type: "uint8",
                  },
                  {
                    name: "precision",
                    type: "uint8",
                  },
                  {
                    name: "priceFeedDecimals",
                    type: "uint8",
                  },
                ],
                name: "rewardsTokenInformation",
                type: "tuple[]",
              },
            ],
            name: "sIncentiveData",
            type: "tuple",
          },
        ],
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
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
    name: "getUserReservesIncentivesData",
    outputs: [
      {
        components: [
          {
            name: "underlyingAsset",
            type: "address",
          },
          {
            components: [
              {
                name: "tokenAddress",
                type: "address",
              },
              {
                name: "incentiveControllerAddress",
                type: "address",
              },
              {
                components: [
                  {
                    name: "rewardTokenSymbol",
                    type: "string",
                  },
                  {
                    name: "rewardOracleAddress",
                    type: "address",
                  },
                  {
                    name: "rewardTokenAddress",
                    type: "address",
                  },
                  {
                    name: "userUnclaimedRewards",
                    type: "uint256",
                  },
                  {
                    name: "tokenIncentivesUserIndex",
                    type: "uint256",
                  },
                  {
                    name: "rewardPriceFeed",
                    type: "int256",
                  },
                  {
                    name: "priceFeedDecimals",
                    type: "uint8",
                  },
                  {
                    name: "rewardTokenDecimals",
                    type: "uint8",
                  },
                ],
                name: "userRewardsInformation",
                type: "tuple[]",
              },
            ],
            name: "aTokenIncentivesUserData",
            type: "tuple",
          },
          {
            components: [
              {
                name: "tokenAddress",
                type: "address",
              },
              {
                name: "incentiveControllerAddress",
                type: "address",
              },
              {
                components: [
                  {
                    name: "rewardTokenSymbol",
                    type: "string",
                  },
                  {
                    name: "rewardOracleAddress",
                    type: "address",
                  },
                  {
                    name: "rewardTokenAddress",
                    type: "address",
                  },
                  {
                    name: "userUnclaimedRewards",
                    type: "uint256",
                  },
                  {
                    name: "tokenIncentivesUserIndex",
                    type: "uint256",
                  },
                  {
                    name: "rewardPriceFeed",
                    type: "int256",
                  },
                  {
                    name: "priceFeedDecimals",
                    type: "uint8",
                  },
                  {
                    name: "rewardTokenDecimals",
                    type: "uint8",
                  },
                ],
                name: "userRewardsInformation",
                type: "tuple[]",
              },
            ],
            name: "vTokenIncentivesUserData",
            type: "tuple",
          },
          {
            components: [
              {
                name: "tokenAddress",
                type: "address",
              },
              {
                name: "incentiveControllerAddress",
                type: "address",
              },
              {
                components: [
                  {
                    name: "rewardTokenSymbol",
                    type: "string",
                  },
                  {
                    name: "rewardOracleAddress",
                    type: "address",
                  },
                  {
                    name: "rewardTokenAddress",
                    type: "address",
                  },
                  {
                    name: "userUnclaimedRewards",
                    type: "uint256",
                  },
                  {
                    name: "tokenIncentivesUserIndex",
                    type: "uint256",
                  },
                  {
                    name: "rewardPriceFeed",
                    type: "int256",
                  },
                  {
                    name: "priceFeedDecimals",
                    type: "uint8",
                  },
                  {
                    name: "rewardTokenDecimals",
                    type: "uint8",
                  },
                ],
                name: "userRewardsInformation",
                type: "tuple[]",
              },
            ],
            name: "sTokenIncentivesUserData",
            type: "tuple",
          },
        ],
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const
