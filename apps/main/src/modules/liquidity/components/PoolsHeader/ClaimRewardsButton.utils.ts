import { FarmDepositReward } from "@galacticcouncil/sdk-next/build/types/farm"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { bestNumberQuery } from "@/api/chain"
import { allDepositsRewardsQuery } from "@/api/farms"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountPositions } from "@/states/account"
import { useAssetsPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

export const useLiquidityMiningRewards = () => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const accountAddress = account?.address

  const { data: bestNumberData } = useQuery(bestNumberQuery(rpc))

  const relayChainBlockNumber = bestNumberData?.relaychainBlockNumber

  const { positions, isPositionsLoading } = useAccountPositions()

  const { data, isPending } = useQuery(
    allDepositsRewardsQuery(
      rpc,
      accountAddress ?? "",
      positions,
      relayChainBlockNumber ?? 0,
      !isPositionsLoading,
    ),
  )

  return useSummarizeClaimableValues(data, isPending)
}

export const useSummarizeClaimableValues = (
  claimableValues: (FarmDepositReward | undefined)[] | undefined,
  isLoadingClaimableValues: boolean,
) => {
  const filteredValues = useMemo(
    () => claimableValues?.filter((value) => !!value) ?? [],
    [claimableValues],
  )

  const assetsId = Array.from(
    new Set(
      filteredValues?.map((claimableValue) =>
        claimableValue.assetId.toString(),
      ) ?? [],
    ),
  )

  const { getAssetPrice, isLoading: isLoadingAssetPrices } =
    useAssetsPrice(assetsId)
  const { getAsset } = useAssets()

  const isLoading = isLoadingAssetPrices || isLoadingClaimableValues

  const [totalUSD, claimableAssetValues] = useMemo(() => {
    if (isLoading) {
      return [Big(0), new Map<string, bigint>()]
    }

    return filteredValues.reduce<
      [totalUSD: Big, claimableAssetValues: Map<string, bigint>]
    >(
      (acc, farm) => {
        const { assetId, reward } = farm
        const assetIdStr = assetId.toString()

        const spotPrice = getAssetPrice(assetIdStr)
        const asset = getAsset(assetId)

        const [totalUSD, claimableAssetValues] = acc

        if (!claimableAssetValues.has(assetIdStr)) {
          claimableAssetValues.set(assetIdStr, 0n)
        }

        const claimableValues = claimableAssetValues.get(assetIdStr) ?? 0n
        claimableAssetValues.set(assetIdStr, claimableValues + reward)

        if (!spotPrice.isValid || !asset) {
          return acc
        }

        const rewardHuman = scaleHuman(reward, asset.decimals)
        const rewardTotal = Big(rewardHuman).times(spotPrice.price).toString()

        return [totalUSD.plus(rewardTotal), claimableAssetValues]
      },
      [Big(0), new Map()],
    )
  }, [filteredValues, getAssetPrice, getAsset, isLoading])

  return {
    totalUSD: totalUSD.toString(),
    claimableAssetValues,
    isLoading,
  }
}
