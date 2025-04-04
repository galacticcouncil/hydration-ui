import {
  calculate_amplification,
  calculate_shares,
} from "@galacticcouncil/math-stableswap"
import { StableMath } from "@galacticcouncil/sdk"
import { useBestNumber } from "api/chain"
import { useStableswapPool } from "api/stableswap"
import { useTotalIssuances } from "api/totalIssuance"
import { scale } from "utils/balance"
import { BN_0, BN_MILL, STABLEPOOL_TOKEN_DECIMALS } from "utils/constants"
import BigNumber from "bignumber.js"
import { scaleHuman } from "utils/balance"
import { TAsset } from "providers/assets"

type Args = {
  poolId: string
  asset: TAsset
  reserves: { asset_id: number; amount: string }[]
}

export const useStablepoolShares = ({ poolId, asset, reserves }: Args) => {
  const pool = useStableswapPool(poolId)
  const bestNumber = useBestNumber()
  const currentBlock = bestNumber.data?.relaychainBlockNumber

  const { data: issuances } = useTotalIssuances()
  const shareIssuance = issuances?.get(poolId)

  return (amount: string) => {
    if (!pool.data || !currentBlock || !shareIssuance || !asset?.decimals) {
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

    const pegs = StableMath.defaultPegs(pool.data.assets.length)

    const shares = calculate_shares(
      JSON.stringify(reserves),
      JSON.stringify(assets),
      amplification,
      shareIssuance.toString(),
      new BigNumber(pool.data.fee.toString()).div(BN_MILL).toString(),
      JSON.stringify(pegs),
    )

    return BigNumber.maximum(
      scaleHuman(shares, STABLEPOOL_TOKEN_DECIMALS),
      BN_0,
    ).toString()
  }
}
