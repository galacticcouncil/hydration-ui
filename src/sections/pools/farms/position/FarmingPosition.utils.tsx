import {
  calculate_liquidity_lrna_out,
  calculate_liquidity_out,
} from "@galacticcouncil/math-omnipool"
import { u32 } from "@polkadot/types"
import { useAssetMeta } from "api/assetMeta"
import { useTokenBalance } from "api/balances"
import { useApiIds } from "api/consts"
import { useOmniPositionIds } from "api/deposits"
import { useOmnipoolAsset, useOmnipoolPositions } from "api/omnipool"
import { useSpotPrice } from "api/spotPrice"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { BN_10, BN_NAN } from "utils/constants"
import BN from "bignumber.js"
import { useQueryReduce } from "utils/helpers"
import { isNotNil } from "utils/helpers"

export const useDepositShare = (poolId: u32, depositNftIds: string[]) => {
  const apiIds = useApiIds()
  const omnipoolBalance = useTokenBalance(poolId, OMNIPOOL_ACCOUNT_ADDRESS)
  const omnipoolAsset = useOmnipoolAsset(poolId)

  const meta = useAssetMeta(poolId)
  const lrnaMeta = useAssetMeta(apiIds.data?.hubId)

  const positionIds = useOmniPositionIds(depositNftIds)

  const positions = useOmnipoolPositions(
    positionIds.map((pos) => pos.data?.value),
  )

  const valueSp = useSpotPrice(poolId, apiIds.data?.usdId)
  const lrnaSp = useSpotPrice(apiIds.data?.hubId, apiIds.data?.usdId)

  return useQueryReduce(
    [
      omnipoolBalance,
      omnipoolAsset,
      meta,
      lrnaMeta,
      valueSp,
      lrnaSp,
      ...positions,
    ] as const,
    (
      omnipoolBalance,
      omnipoolAsset,
      meta,
      lrnaMeta,
      valueSp,
      lrnaSp,
      ...positions
    ) => {
      const rows = positions
        .map((position) => {
          let lernaOutResult = "-1"
          let liquidityOutResult = "-1"
          if (position && omnipoolBalance && omnipoolAsset && meta) {
            const [nom, denom] =
              position.price.map((n) => new BN(n.toString())) ?? []
            const price = nom.div(denom)
            const positionPrice = price.times(BN_10.pow(18))

            const params: Parameters<typeof calculate_liquidity_out> = [
              omnipoolBalance.balance.toString(),
              omnipoolAsset.hubReserve.toString(),
              omnipoolAsset.shares.toString(),
              position.amount.toString(),
              position.shares.toString(),
              positionPrice.toFixed(0),
              position.shares.toString(),
            ]

            lernaOutResult = calculate_liquidity_lrna_out.apply(this, params)
            liquidityOutResult = calculate_liquidity_out.apply(this, params)

            const lrnaDp = BN_10.pow(lrnaMeta?.decimals.toNumber() ?? 12)
            const lrna =
              lernaOutResult !== "-1"
                ? new BN(lernaOutResult).div(lrnaDp)
                : BN_NAN

            const valueDp = BN_10.pow(meta.decimals.toNumber() ?? 12)
            const value =
              liquidityOutResult !== "-1"
                ? new BN(liquidityOutResult).div(valueDp)
                : BN_NAN

            let valueUSD = BN_NAN

            if (liquidityOutResult !== "-1" && valueSp) {
              valueUSD = value.times(valueSp.spotPrice)

              if (lrna.gt(0)) {
                valueUSD = !lrnaSp
                  ? BN_NAN
                  : valueUSD.plus(lrna.times(lrnaSp.spotPrice))
              }
            }

            return {
              ...position,
              value,
              valueUSD,
              lrna,
              symbol: meta.symbol,
            }
          }
          return null
        })
        .filter(isNotNil)

      return rows
    },
  )
}
