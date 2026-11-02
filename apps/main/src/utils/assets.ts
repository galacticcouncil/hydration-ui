export const BLACKLISTED_ASSET_IDS = ["1000042", "101"]

export const isBlacklistedAsset = (id: string | number) =>
  BLACKLISTED_ASSET_IDS.includes(String(id))
