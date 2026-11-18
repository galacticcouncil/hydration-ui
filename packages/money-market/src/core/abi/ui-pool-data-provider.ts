/**
 * UiPoolDataProviderV3 — the bulk reserve read.
 *
 * `getReservesData` returns the reserve tuple array plus the market's base
 * currency info in one call; `getUserReservesData` returns a user's per-reserve
 * state plus their e-mode category id.
 *
 * The returned structs still carry the stable-rate fields (`stableBorrowRate`,
 * `totalPrincipalStableDebt`, `averageStableRate`, …). They are part of the
 * on-chain return layout, so removing them would break decoding — unlike the
 * stable-rate *functions*, which are cut. Nothing above the decode boundary
 * reads them.
 *
 * Ported from `@aave/contract-helpers` 1.23.1 typechain factories. Internal to
 * core — never re-exported from a public entrypoint.
 */
export const uiPoolDataProviderAbi = [
  {
    inputs: [
      {
        name: "provider",
        type: "address",
      },
    ],
    name: "getReservesData",
    outputs: [
      {
        components: [
          {
            name: "underlyingAsset",
            type: "address",
          },
          {
            name: "name",
            type: "string",
          },
          {
            name: "symbol",
            type: "string",
          },
          {
            name: "decimals",
            type: "uint256",
          },
          {
            name: "baseLTVasCollateral",
            type: "uint256",
          },
          {
            name: "reserveLiquidationThreshold",
            type: "uint256",
          },
          {
            name: "reserveLiquidationBonus",
            type: "uint256",
          },
          {
            name: "reserveFactor",
            type: "uint256",
          },
          {
            name: "usageAsCollateralEnabled",
            type: "bool",
          },
          {
            name: "borrowingEnabled",
            type: "bool",
          },
          {
            name: "stableBorrowRateEnabled",
            type: "bool",
          },
          {
            name: "isActive",
            type: "bool",
          },
          {
            name: "isFrozen",
            type: "bool",
          },
          {
            name: "liquidityIndex",
            type: "uint128",
          },
          {
            name: "variableBorrowIndex",
            type: "uint128",
          },
          {
            name: "liquidityRate",
            type: "uint128",
          },
          {
            name: "variableBorrowRate",
            type: "uint128",
          },
          {
            name: "stableBorrowRate",
            type: "uint128",
          },
          {
            name: "lastUpdateTimestamp",
            type: "uint40",
          },
          {
            name: "aTokenAddress",
            type: "address",
          },
          {
            name: "stableDebtTokenAddress",
            type: "address",
          },
          {
            name: "variableDebtTokenAddress",
            type: "address",
          },
          {
            name: "interestRateStrategyAddress",
            type: "address",
          },
          {
            name: "availableLiquidity",
            type: "uint256",
          },
          {
            name: "totalPrincipalStableDebt",
            type: "uint256",
          },
          {
            name: "averageStableRate",
            type: "uint256",
          },
          {
            name: "stableDebtLastUpdateTimestamp",
            type: "uint256",
          },
          {
            name: "totalScaledVariableDebt",
            type: "uint256",
          },
          {
            name: "priceInMarketReferenceCurrency",
            type: "uint256",
          },
          {
            name: "priceOracle",
            type: "address",
          },
          {
            name: "variableRateSlope1",
            type: "uint256",
          },
          {
            name: "variableRateSlope2",
            type: "uint256",
          },
          {
            name: "stableRateSlope1",
            type: "uint256",
          },
          {
            name: "stableRateSlope2",
            type: "uint256",
          },
          {
            name: "baseStableBorrowRate",
            type: "uint256",
          },
          {
            name: "baseVariableBorrowRate",
            type: "uint256",
          },
          {
            name: "optimalUsageRatio",
            type: "uint256",
          },
          {
            name: "isPaused",
            type: "bool",
          },
          {
            name: "isSiloedBorrowing",
            type: "bool",
          },
          {
            name: "accruedToTreasury",
            type: "uint128",
          },
          {
            name: "unbacked",
            type: "uint128",
          },
          {
            name: "isolationModeTotalDebt",
            type: "uint128",
          },
          {
            name: "flashLoanEnabled",
            type: "bool",
          },
          {
            name: "debtCeiling",
            type: "uint256",
          },
          {
            name: "debtCeilingDecimals",
            type: "uint256",
          },
          {
            name: "eModeCategoryId",
            type: "uint8",
          },
          {
            name: "borrowCap",
            type: "uint256",
          },
          {
            name: "supplyCap",
            type: "uint256",
          },
          {
            name: "eModeLtv",
            type: "uint16",
          },
          {
            name: "eModeLiquidationThreshold",
            type: "uint16",
          },
          {
            name: "eModeLiquidationBonus",
            type: "uint16",
          },
          {
            name: "eModePriceSource",
            type: "address",
          },
          {
            name: "eModeLabel",
            type: "string",
          },
          {
            name: "borrowableInIsolation",
            type: "bool",
          },
        ],
        name: "",
        type: "tuple[]",
      },
      {
        components: [
          {
            name: "marketReferenceCurrencyUnit",
            type: "uint256",
          },
          {
            name: "marketReferenceCurrencyPriceInUsd",
            type: "int256",
          },
          {
            name: "networkBaseTokenPriceInUsd",
            type: "int256",
          },
          {
            name: "networkBaseTokenPriceDecimals",
            type: "uint8",
          },
        ],
        name: "",
        type: "tuple",
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
    name: "getUserReservesData",
    outputs: [
      {
        components: [
          {
            name: "underlyingAsset",
            type: "address",
          },
          {
            name: "scaledATokenBalance",
            type: "uint256",
          },
          {
            name: "usageAsCollateralEnabledOnUser",
            type: "bool",
          },
          {
            name: "stableBorrowRate",
            type: "uint256",
          },
          {
            name: "scaledVariableDebt",
            type: "uint256",
          },
          {
            name: "principalStableDebt",
            type: "uint256",
          },
          {
            name: "stableBorrowLastUpdateTimestamp",
            type: "uint256",
          },
        ],
        name: "",
        type: "tuple[]",
      },
      {
        name: "",
        type: "uint8",
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
    ],
    name: "getReservesList",
    outputs: [
      {
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const
