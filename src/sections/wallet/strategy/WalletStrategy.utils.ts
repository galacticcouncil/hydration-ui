import { useRpcProvider } from "providers/rpcProvider"
import { GDOT_STABLESWAP_ASSET_ID, GDOT_ERC20_ASSET_ID } from "utils/constants"

type Result = {
  readonly assetId: string
  readonly underlyingAssetId: string
}

export const useGigadotAssetIds = (): Result => {
  const { dataEnv } = useRpcProvider()

  const [assetId, underlyingAssetId] =
    dataEnv === "mainnet"
      ? [GDOT_STABLESWAP_ASSET_ID, GDOT_ERC20_ASSET_ID]
      : // erc20 and stableswap asset IDs are flipped on testnet
        [GDOT_ERC20_ASSET_ID, GDOT_STABLESWAP_ASSET_ID]

  return { assetId, underlyingAssetId }
}
