import { useRpcProvider } from "providers/rpcProvider"
import { GDOT_STABLESWAP_ASSET_ID, GDOT_ERC20_ASSET_ID } from "utils/constants"

export const useGigadotAssetIds = () => {
  const { dataEnv } = useRpcProvider()

  const [gdotAssetId, underlyingGdotAssetId] =
    dataEnv === "mainnet"
      ? [GDOT_STABLESWAP_ASSET_ID, GDOT_ERC20_ASSET_ID]
      : // erc20 and stableswap asset IDs are flipped on testnet
        [GDOT_ERC20_ASSET_ID, GDOT_STABLESWAP_ASSET_ID]

  return { gdotAssetId, underlyingGdotAssetId }
}
