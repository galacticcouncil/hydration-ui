/**
 * Map of aTokens and their corresponding underlying asset ids
 */
export const A_TOKEN_UNDERLYING_ID_MAP_TESTNET: { [key: string]: string } = {
  // aDOT
  "1000037": "5",
  // aUSDT
  "1000039": "10",
  // aUSDC
  "1000038": "21",
  // aWETH
  "1000041": "20",
  // aWBTC
  "1000040": "3",
}

export const A_TOKEN_UNDERLYING_ID_MAP_MAINNET: { [key: string]: string } = {}

export const A_TOKEN_UNDERLYING_ID_MAP =
  import.meta.env.VITE_ENV === "production"
    ? A_TOKEN_UNDERLYING_ID_MAP_MAINNET
    : A_TOKEN_UNDERLYING_ID_MAP_TESTNET
