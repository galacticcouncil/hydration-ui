import {
  calculate_amplification,
  calculate_shares,
} from "@galacticcouncil/math-stableswap"
import { useBestNumber } from "api/chain"
import { useStableswapPool } from "api/stableswap"
import { useTotalIssuance } from "api/totalIssuance"
import { scale } from "utils/balance"
import { BN_0, BN_MILL, STABLEPOOL_TOKEN_DECIMALS } from "utils/constants"
import BigNumber from "bignumber.js"
import { scaleHuman } from "utils/balance"
import { TAsset } from "api/assetDetails"

type Args = {
  poolId: string
  asset: TAsset
  reserves: { asset_id: number; amount: string }[]
}

export const useStablepoolShares = ({ poolId, asset, reserves }: Args) => {
  const pool = useStableswapPool(poolId)
  const bestNumber = useBestNumber()
  const currentBlock = bestNumber.data?.relaychainBlockNumber
  const shareIssuance = useTotalIssuance(poolId)

  return (amount: string) => {
    if (
      !pool.data ||
      !currentBlock ||
      !shareIssuance?.data ||
      !asset?.decimals
    ) {
      return undefined
    }

    const amplification = calculate_amplification(
      pool.data.initialAmplification.toString(),
      pool.data.finalAmplification.toString(),
      pool.data.initialBlock.toString(),
      pool.data.finalBlock.toString(),
      currentBlock.toString(),
    )

    const assets = [
      {
        asset_id: Number(asset.id),
        amount: scale(amount, asset.decimals).toString(),
      },
    ]

    const shares = calculate_shares(
      JSON.stringify(reserves),
      JSON.stringify(assets),
      amplification,
      shareIssuance.data.total.toString(),
      new BigNumber(pool.data.fee.toString()).div(BN_MILL).toString(),
    )

    return BigNumber.maximum(
      scaleHuman(shares, STABLEPOOL_TOKEN_DECIMALS),
      BN_0,
    ).toString()
  }
}
