import { useTotalIssuance } from "api/totalIssuance"
import { useTotalInPool } from "sections/pools/pool/Pool.utils"
import { useMemo } from "react"
import { u32 } from "@polkadot/types"
import { Maybe } from "utils/types"
import { PoolBase } from "@galacticcouncil/sdk"
import BN from "bignumber.js"
import { BN_10 } from "utils/constants"

export const useCurrentSharesValue = ({
  shareToken,
  shareTokenBalance,
  pool,
}: {
  shareToken: Maybe<u32>
  shareTokenBalance: BN
  pool: PoolBase
}) => {
  const totalIssuance = useTotalIssuance(shareToken)
  const totalInPool = useTotalInPool({ pool })

  const isLoading = totalIssuance.isLoading || totalInPool.isLoading

  const data = useMemo(() => {
    if (!totalIssuance.data || !totalInPool.data) return undefined

    const issuance = totalIssuance.data.total
    const liquidity = totalInPool.data
    const ratio = shareTokenBalance.div(issuance)

    const [assetA, assetB] = pool.tokens
    const balanceA = new BN(assetA.balance).div(
      BN_10.pow(new BN(assetA.decimals)),
    )
    const balanceB = new BN(assetB.balance).div(
      BN_10.pow(new BN(assetB.decimals)),
    )

    const amountA = balanceA.times(ratio)
    const amountB = balanceB.times(ratio)
    const dollarValue = liquidity.times(ratio)

    return {
      assetA: { symbol: assetA.symbol, amount: amountA },
      assetB: { symbol: assetB.symbol, amount: amountB },
      dollarValue,
    }
  }, [totalIssuance.data, totalInPool.data, shareTokenBalance, pool])

  return { ...data, isLoading }
}
