export const BLACKLISTED_ASSET_IDS = ["1000042", "101"]

export const isBlacklistedAsset = (id: string | number) =>
  BLACKLISTED_ASSET_IDS.includes(String(id))

export const ASSET_ICON_OVERRIDES: Record<string, string> = {
  "19": "1000190",
  "20": "1000189",
  "21": "22",
  "23": "10",
  "1000745": "1000626",
}

export const ASSET_NAME_OVERRIDES: Record<string, string> = {
  "18": "DAI (Wormhole)",
  "19": "Wrapped BTC (Wormhole)",
  "20": "Wrapped ETH (Wormhole)",
  "21": "USDC (Wormhole)",
  "23": "Tether (Wormhole)",
  "44": "EURC (Wormhole)",
  "1000745": "sUSDS (Wormhole)",
  "1000752": "Solana (Wormhole)",
  "1000753": "SUI (Wormhole)",
}
