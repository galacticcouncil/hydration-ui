import {
  calculate_amplification,
  calculate_liquidity_out_one_asset,
} from "@galacticcouncil/math-stableswap"
import { useBestNumber } from "api/chain"
import { useStableswapPool } from "api/stableswap"
import { u32 } from "@polkadot/types-codec"
import { useTotalIssuance } from "api/totalIssuance"
import { normalizeBigNumber } from "utils/balance"
import { BN_0, BN_NAN } from "utils/constants"
import BigNumber from "bignumber.js"
import { u8 } from "@polkadot/types"

type Args = {
  poolId: u32
  shares: BigNumber
  asset?: { id: string; decimals: u32 | u8 }
  withdrawFee: BigNumber
  reserves: { asset_id: number; amount: string }[]
}

export const useStablepoolLiquidiyOut = ({
  poolId,
  asset,
  withdrawFee,
  reserves,
  shares,
}: Args) => {
  const pool = useStableswapPool(poolId)
  const bestNumber = useBestNumber()
  const currentBlock = bestNumber.data?.relaychainBlockNumber
  const shareIssuance = useTotalIssuance(poolId)

  if (!pool.data || !currentBlock || !shareIssuance?.data || !asset) {
    return BN_NAN
  }

  const amplification = calculate_amplification(
    pool.data.initialAmplification.toString(),
    pool.data.finalAmplification.toString(),
    pool.data.initialBlock.toString(),
    pool.data.finalBlock.toString(),
    currentBlock.toString(),
  )

  const result = calculate_liquidity_out_one_asset(
    JSON.stringify(reserves),
    shares.dp(0).toString(),
    Number(asset.id),
    amplification,
    shareIssuance.data.total.toString(),
    withdrawFee.times(10000).toString(),
  )

  return BigNumber.maximum(
    normalizeBigNumber(result).shiftedBy(
      normalizeBigNumber(asset.decimals).negated().toNumber(),
    ),
    BN_0,
  ).toString()
}
