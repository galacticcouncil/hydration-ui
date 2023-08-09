import {
  calculate_amplification,
  calculate_shares,
} from "@galacticcouncil/math-stableswap"
import { useBestNumber } from "api/chain"
import { useStableswapPool } from "api/stableswap"
import { u32 } from "@polkadot/types-codec"
import { useTotalIssuance } from "api/totalIssuance"
import { normalizeBigNumber } from "utils/balance"
import { BalanceByAsset } from "../../PoolsPage.utils"

type Asset = { asset_id: number; amount: number }

type Args = {
  poolId: u32
  asset?: { id?: string; amount?: string }
  balanceByAsset?: BalanceByAsset
}

export const useStablepoolShares = ({
  poolId,
  asset,
  balanceByAsset,
}: Args) => {
  const pool = useStableswapPool(poolId)
  const bestNumber = useBestNumber()
  const currentBlock = bestNumber.data?.relaychainBlockNumber
  const shareIssuance = useTotalIssuance(poolId)

  if (!pool.data || !currentBlock || !shareIssuance?.data) {
    return { shares: undefined, assets: [] }
  }

  const amplification = calculate_amplification(
    pool.data.initialAmplification.toString(),
    pool.data.finalAmplification.toString(),
    pool.data.initialBlock.toString(),
    pool.data.finalBlock.toString(),
    currentBlock.toString(),
  )

  const reserves: Asset[] = []

  balanceByAsset?.forEach((balance, assetId) => {
    reserves.push({
      asset_id: Number(assetId),
      amount: balance.free.toNumber(),
    })
  })

  const assets: Asset[] =
    asset?.id && asset.amount
      ? [
          {
            asset_id: Number(asset.id),
            amount: normalizeBigNumber(asset.amount).toNumber(),
          },
        ]
      : []

  return {
    shares: calculate_shares(
      JSON.stringify(reserves),
      JSON.stringify(assets),
      amplification,
      shareIssuance.data.total.toString(),
    ),
    assets,
  }
}
