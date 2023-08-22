import {
  calculate_amplification,
  calculate_shares,
} from "@galacticcouncil/math-stableswap"
import { useBestNumber } from "api/chain"
import { useStableswapPool } from "api/stableswap"
import { u32 } from "@polkadot/types-codec"
import { useTotalIssuance } from "api/totalIssuance"
import { normalizeBigNumber } from "utils/balance"
import { BalanceByAsset } from "sections/pools/PoolsPage.utils"
import { u8 } from "@polkadot/types"
import { BN_0, STABLEPOOL_TOKEN_DECIMALS } from "utils/constants"
import BigNumber from "bignumber.js"

type Asset = { asset_id: number; amount: string }

type Args = {
  poolId: u32
  asset?: { id?: string; amount?: string; decimals?: u32 | u8 }
  balanceByAsset?: BalanceByAsset
  reserves: { asset_id: number; amount: string }[]
}

export const useStablepoolShares = ({ poolId, asset, reserves }: Args) => {
  const pool = useStableswapPool(poolId)
  const bestNumber = useBestNumber()
  const currentBlock = bestNumber.data?.relaychainBlockNumber
  const shareIssuance = useTotalIssuance(poolId)

  if (!pool.data || !currentBlock || !shareIssuance?.data || !asset?.decimals) {
    return { shares: undefined, assets: [] }
  }

  const amplification = calculate_amplification(
    pool.data.initialAmplification.toString(),
    pool.data.finalAmplification.toString(),
    pool.data.initialBlock.toString(),
    pool.data.finalBlock.toString(),
    currentBlock.toString(),
  )

  const assets: Asset[] =
    asset?.id && asset.amount
      ? [
          {
            asset_id: Number(asset.id),
            amount: normalizeBigNumber(asset.amount)
              .shiftedBy(normalizeBigNumber(asset.decimals).toNumber())
              .toString(),
          },
        ]
      : []

  const shares = calculate_shares(
    JSON.stringify(reserves),
    JSON.stringify(assets),
    amplification,
    shareIssuance.data.total.toString(),
  )

  return {
    shares: BigNumber.maximum(
      normalizeBigNumber(shares).shiftedBy(-STABLEPOOL_TOKEN_DECIMALS),
      BN_0,
    ).toString(),
    assets,
  }
}
