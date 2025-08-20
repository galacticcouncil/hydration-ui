import { useAccountBalances } from "api/deposits"
import { useAssets } from "providers/assets"
import { useRpcProvider } from "providers/rpcProvider"
import {
  GDOT_STABLESWAP_ASSET_ID,
  GDOT_ERC20_ASSET_ID,
  HOLLAR_ASSETS,
  HOLLAR_ID,
} from "utils/constants"
import { scaleHuman } from "utils/balance"
import { useBorrowAssetsApy } from "api/borrow"
import { isNotNil } from "utils/helpers"

export const useGigadotAssetIds = () => {
  const { dataEnv } = useRpcProvider()

  const [gdotAssetId, underlyingGdotAssetId] =
    dataEnv === "mainnet"
      ? [GDOT_STABLESWAP_ASSET_ID, GDOT_ERC20_ASSET_ID]
      : // erc20 and stableswap asset IDs are flipped on testnet
        [GDOT_ERC20_ASSET_ID, GDOT_STABLESWAP_ASSET_ID]

  return { gdotAssetId, underlyingGdotAssetId }
}

export const useHollarPools = () => {
  const { getRelatedAToken, getAssetWithFallback, getErc20 } = useAssets()

  const { data: hollarsApy, isLoading } = useBorrowAssetsApy(HOLLAR_ASSETS)

  const { data: accountBalances } = useAccountBalances()
  const accountAssetsMap = accountBalances?.accountAssetsMap

  const data = hollarsApy
    .map((asset) => {
      const { assetId, totalBorrowApy, tvl } = asset
      const aToken = getRelatedAToken(assetId)

      if (!aToken) return undefined

      const meta = getAssetWithFallback(aToken.id)
      const stableswapMeta = getAssetWithFallback(assetId).meta
      const reserveAssets = stableswapMeta ? Object.keys(stableswapMeta) : []

      const reserveBalances = []

      for (const reserveAssetId of reserveAssets) {
        if (reserveAssetId === HOLLAR_ID) continue

        const idsToCheck = [reserveAssetId]
        const underlyingAssetId = getErc20(reserveAssetId)?.underlyingAssetId
        if (underlyingAssetId) idsToCheck.push(underlyingAssetId)

        for (const id of idsToCheck) {
          const accountBalance = accountAssetsMap?.get(id)

          if (accountBalance) {
            reserveBalances.push({
              id,
              balance: scaleHuman(
                accountBalance.balance.transferable,
                accountBalance.asset.decimals,
              ).toFixed(4),
            })
          }
        }
      }

      const userShiftedBalance = scaleHuman(
        accountAssetsMap?.get(aToken.id)?.balance.free ?? "0",
        meta.decimals,
      ).toString()

      return {
        userShiftedBalance,
        meta,
        stablepoolId: assetId,
        apy: Number(totalBorrowApy.toFixed(2)),
        tvl,
        reserveBalances,
      }
    })
    .filter(isNotNil)

  return { data, isLoading }
}
