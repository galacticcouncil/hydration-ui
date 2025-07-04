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
import { useOmnipoolDataObserver } from "api/omnipool"
import { getSharesToGet } from "sections/pools/modals/AddLiquidity/AddLiquidity.utils"

type Args = {
  poolId: string
  asset: TAsset
  reserves: { asset_id: number; amount: string }[]
  isGETHSelected: boolean
}

export const useStablepoolShares = ({
  poolId,
  asset,
  reserves,
  isGETHSelected,
}: Args) => {
  const { dataMap } = useOmnipoolDataObserver()
  const ommipoolAsset = dataMap?.get(asset.id)
  const { data: pool } = useStableswapPool(poolId)

  const { data: bestNumber } = useBestNumber()
  const currentBlock = bestNumber?.relaychainBlockNumber

  const { data: issuances } = useTotalIssuances()
  const shareIssuance = issuances?.get(poolId)

  const totalShares = isGETHSelected
    ? ommipoolAsset?.shares
    : shareIssuance?.toString()

  const getShares = (amount: string) => {
    if (isGETHSelected) {
      return ommipoolAsset
        ? getSharesToGet(
            ommipoolAsset,
            scale(amount, asset.decimals).toString(),
          )
            .shiftedBy(-asset.decimals)
            .toString()
        : undefined
    }

    if (!pool || !currentBlock || !shareIssuance || !asset?.decimals) {
      return undefined
    }

    const amplification = calculate_amplification(
      pool.initialAmplification.toString(),
      pool.finalAmplification.toString(),
      pool.initialBlock.toString(),
      pool.finalBlock.toString(),
      currentBlock.toString(),
    )

    const assets = [
      {
        asset_id: Number(asset.id),
        amount: scale(amount, asset.decimals).toString(),
      },
    ]

    const pegs = StableMath.defaultPegs(pool.assets.length)

    const shares = calculate_shares(
      JSON.stringify(reserves),
      JSON.stringify(assets),
      amplification,
      shareIssuance.toString(),
      new BigNumber(pool.fee.toString()).div(BN_MILL).toString(),
      JSON.stringify(pegs),
    )

    return BigNumber.maximum(
      scaleHuman(shares, STABLEPOOL_TOKEN_DECIMALS),
      BN_0,
    ).toString()
  }

  return { getShares, totalShares }
}
