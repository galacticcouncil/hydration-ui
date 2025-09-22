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
import BN from "bignumber.js"
import { THollarPool } from "sections/wallet/strategy/StrategyTile/HollarTile"

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
      const { assetId, totalSupplyApy, tvl, stablepoolData } = asset
      const aToken = getRelatedAToken(assetId)

      if (!aToken || !stablepoolData) return undefined

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
            const balance = scaleHuman(
              accountBalance.balance.transferable,
              accountBalance.asset.decimals,
            ).toFixed(4)

            if (BN(balance).gte(1)) {
              reserveBalances.push({
                id,
                balance,
                symbol: accountBalance.asset.symbol,
              })
            }
          }
        }
      }

      const userShiftedBalance = scaleHuman(
        accountAssetsMap?.get(aToken.id)?.balance.free ?? "0",
        meta.decimals,
      ).toString()

      const userShiftedTransferableBalance = scaleHuman(
        accountAssetsMap?.get(aToken.id)?.balance.transferable ?? "0",
        meta.decimals,
      ).toString()

      return {
        userShiftedBalance,
        userShiftedTransferableBalance,
        meta,
        stablepoolId: assetId,
        stablepoolData,
        apy: Number(totalSupplyApy.toFixed(2)),
        tvl,
        reserveBalances,
      } satisfies THollarPool
    })
    .filter(isNotNil)

  return { data, isLoading }
}
