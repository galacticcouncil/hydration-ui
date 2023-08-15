import {
  calculate_amplification,
  calculate_liquidity_out_one_asset,
} from "@galacticcouncil/math-stableswap"
import { useBestNumber } from "api/chain"
import { useStableswapPool } from "api/stableswap"
import { u32 } from "@polkadot/types-codec"
import { useTotalIssuance } from "api/totalIssuance"
import { normalizeBigNumber } from "utils/balance"
import { BN_0, BN_NAN, STABLEPOOL_TOKEN_DECIMALS } from "utils/constants"
import BigNumber from "bignumber.js"

type Args = {
  poolId: u32
  shares: BigNumber
  assetId?: string
  withdrawFee: BigNumber
  reserves: { asset_id: number; amount: string }[]
}

export const useStablepoolLiquidiyOut = ({
  poolId,
 assetId,
  withdrawFee,
  reserves,
  shares,
}: Args) => {
  const pool = useStableswapPool(poolId)
  const bestNumber = useBestNumber()
  const currentBlock = bestNumber.data?.relaychainBlockNumber
  const shareIssuance = useTotalIssuance(poolId)

  if (!pool.data || !currentBlock || !shareIssuance?.data) {
    return BN_NAN
  }

  const amplification = calculate_amplification(
    pool.data.initialAmplification.toString(),
    pool.data.finalAmplification.toString(),
    pool.data.initialBlock.toString(),
    pool.data.finalBlock.toString(),
    currentBlock.toString(),
  )

  // [{"asset_id":10,"amount":"9000000000"},{"asset_id":2,"amount":"5000000000000000000000"}]
  // 40379600762990012.7
  // 2
  // 1000
  // 61181213277257595
  // 3000

  const result = calculate_liquidity_out_one_asset(
    JSON.stringify(reserves),
    shares.toString(),
    Number(assetId),
    amplification,
    shareIssuance.data.total.toString(),
    withdrawFee.times(10000).toString(),
  )

  return BigNumber.maximum(
    normalizeBigNumber(result).shiftedBy(-STABLEPOOL_TOKEN_DECIMALS),
    BN_0,
  ).toString()
}
