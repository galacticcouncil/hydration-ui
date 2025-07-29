import {
  calculate_amplification,
  calculate_liquidity_out_one_asset,
} from "@galacticcouncil/math-stableswap"
import { StableMath } from "@galacticcouncil/sdk"
import { useBestNumber } from "api/chain"
import { useStableswapPool } from "api/stableswap"
import { useTotalIssuances } from "api/totalIssuance"
import { useCallback, useMemo } from "react"
import BN from "bignumber.js"
import { BN_MILL } from "utils/constants"

type Args = {
  poolId: string
  reserves: { asset_id: number; amount: string }[]
}

export const useStablepoolLiquidityOut = ({ poolId, reserves }: Args) => {
  const { data: pool } = useStableswapPool(poolId)
  const { data: bestNumber } = useBestNumber()
  const { data: issuances } = useTotalIssuances()

  const currentBlock = bestNumber?.relaychainBlockNumber.toString()
  const shareIssuance = issuances?.get(poolId)?.toString()

  const amplification = useMemo(() => {
    if (pool && currentBlock) {
      return calculate_amplification(
        pool.initialAmplification.toString(),
        pool.finalAmplification.toString(),
        pool.initialBlock.toString(),
        pool.finalBlock.toString(),
        currentBlock,
      )
    }
  }, [pool, currentBlock])

  const getAssetOutValue = useCallback(
    (assetId: number, shares: string) => {
      if (amplification && shareIssuance && pool) {
        const stablepoolFee = BN(pool.fee.toString()).div(BN_MILL).toString()
        const pegs = StableMath.defaultPegs(pool.assets.length)
        return calculate_liquidity_out_one_asset(
          JSON.stringify(reserves),
          shares,
          assetId,
          amplification,
          shareIssuance,
          stablepoolFee,
          JSON.stringify(pegs),
        )
      }

      return "0"
    },
    [pool, amplification, reserves, shareIssuance],
  )

  const getAssetOutProportionally = useCallback(
    (reserveAmount: string, removeTotalShares: string) => {
      if (shareIssuance) {
        return BN(removeTotalShares)
          .div(shareIssuance)
          .times(reserveAmount)
          .toString()
      }

      return "0"
    },
    [shareIssuance],
  )

  return {
    getAssetOutValue,
    getAssetOutProportionally,
  }
}
