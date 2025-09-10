import { FarmDepositReward } from "@galacticcouncil/sdk-next/build/types/client/LiquidityMiningClient"
import { useQueries, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { bestNumberQuery } from "@/api/chain"
import { depositRewardsQuery } from "@/api/farms"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountPositions } from "@/states/account"
import { useAssetsPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

export const useLiquidityMiningRewards = () => {
  const rpc = useRpcProvider()

  const { data: bestNumberData, isLoading: bestNumberIsLoading } = useQuery(
    bestNumberQuery(rpc),
  )

  const relayChainBlockNumber = bestNumberData?.relaychainBlockNumber

  const { positions, isPositionsLoading } = useAccountPositions()

  const allDeposits = positions.xykMining
    .map(
      (deposit) =>
        [
          deposit.amm_pool_id.toString(),
          true as boolean,
          deposit.yield_farm_entries,
        ] as const,
    )
    .concat(
      positions.omnipoolMining.map(
        (deposit) =>
          [deposit.assetId, false, deposit.yield_farm_entries] as const,
      ),
    )

  const queries = useQueries({
    queries: allDeposits.flatMap(([poolId, isXyk, yield_farm_entries]) =>
      yield_farm_entries.map((farmEntry) => ({
        ...depositRewardsQuery(
          rpc,
          poolId,
          farmEntry,
          isXyk,
          relayChainBlockNumber ?? 0,
        ),
        enabled: !bestNumberIsLoading && !isPositionsLoading,
      })),
    ),
  })

  const farmRewards = queries.flatMap((query) => query.data ?? [])
  const isLoading = queries.some((query) => query.isLoading)

  return useSummarizeClaimableValues(farmRewards, isLoading)
}

export const useSummarizeClaimableValues = (
  claimableValues: FarmDepositReward[],
  _isLoading: boolean,
) => {
  const assetsId = Array.from(
    new Set(
      claimableValues.map((claimableValue) =>
        claimableValue.assetId.toString(),
      ),
    ),
  )

  const { getAssetPrice, isLoading } = useAssetsPrice(assetsId)
  const { getAsset } = useAssets()

  const total = useMemo(() => {
    if (isLoading || _isLoading) {
      return "0"
    }

    return claimableValues.reduce<Big>((acc, farm) => {
      const { assetId, reward } = farm

      const spotPrice = getAssetPrice(assetId.toString())
      const asset = getAsset(assetId)

      if (!spotPrice.isValid || !asset) {
        return acc
      }

      const rewardHuman = scaleHuman(reward, asset.decimals)
      const rewardTotal = Big(rewardHuman).times(spotPrice.price).toString()

      return acc.plus(rewardTotal)
    }, Big(0))
  }, [claimableValues, getAssetPrice, getAsset, isLoading, _isLoading])

  return {
    total: total.toString(),
    isLoading: _isLoading || isLoading,
  }
}
