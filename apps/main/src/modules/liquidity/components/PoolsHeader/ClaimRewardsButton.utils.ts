import { FarmDepositReward } from "@galacticcouncil/sdk-next/build/types/farm"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useRelayChainBlockNumber } from "@/api/chain"
import { FarmRewards, useFarmRewards } from "@/api/farms"
import { useXykPools } from "@/api/pools"
import { AnyPapiTx } from "@/modules/transactions/types"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountPositions } from "@/states/account"
import { useAssetsPrice } from "@/states/displayAsset"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

export const useLiquidityMiningRewards = () => {
  const relayChainBlockNumber = useRelayChainBlockNumber()

  const { positions } = useAccountPositions()

  const validPositions = [...positions.omnipoolMining, ...positions.xykMining]

  const {
    data: rewards,
    isPending,
    refetch,
  } = useFarmRewards(validPositions, relayChainBlockNumber)

  const claimableValues = useSummarizeClaimableValues(
    rewards?.map((deposit) => deposit.rewards),
    isPending,
  )

  return { claimableValues, rewards, refetch }
}

export const useSummarizeClaimableValues = (
  claimableValues: FarmDepositReward[] | undefined,
  isLoadingClaimableValues: boolean,
) => {
  const assetsId = Array.from(
    new Set(
      claimableValues?.map((claimableValue) =>
        claimableValue.assetId.toString(),
      ) ?? [],
    ),
  )

  const { getAssetPrice, isLoading: isLoadingAssetPrices } =
    useAssetsPrice(assetsId)
  const { getAsset } = useAssets()

  const isLoading = isLoadingAssetPrices || isLoadingClaimableValues

  const [totalUSD, claimableAssetValues] = useMemo(() => {
    if (isLoading || !claimableValues) {
      return [Big(0), new Map<string, bigint>()]
    }

    return claimableValues.reduce<
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
  }, [claimableValues, getAssetPrice, getAsset, isLoading])

  return {
    totalUSD: totalUSD.toString(),
    claimableAssetValues,
    isLoading,
  }
}

export const useClaimFarmRewardsMutation = ({
  claimableDeposits,
  onSuccess,
}: {
  claimableDeposits: FarmRewards[]
  onSuccess?: () => void
}) => {
  const { t } = useTranslation("liquidity")
  const { papi } = useRpcProvider()
  const { data: pools } = useXykPools()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  return useMutation({
    mutationFn: async ({ displayValue }: { displayValue: string }) => {
      if (!pools) throw new Error("Pools not found")

      const omnipoolTxs: Array<AnyPapiTx> = []
      const xykTxs: Array<AnyPapiTx> = []

      claimableDeposits.forEach((farm) => {
        if (farm.isXyk) {
          if (farm.isActiveFarm) {
            const tx = papi.tx.XYKLiquidityMining.claim_rewards({
              deposit_id: BigInt(farm.depositId),
              yield_farm_id: farm.yieldFarmId,
            })

            xykTxs.push(tx)
          } else {
            const [assetA, assetB] =
              pools?.find((pool) => pool.address === farm.assetId)?.tokens ?? []

            if (assetA && assetB) {
              const tx = papi.tx.XYKLiquidityMining.withdraw_shares({
                deposit_id: BigInt(farm.depositId),
                yield_farm_id: farm.yieldFarmId,
                asset_pair: {
                  asset_in: assetA.id,
                  asset_out: assetB.id,
                },
              })

              xykTxs.push(tx)
            }
          }
        } else {
          const tx = farm.isActiveFarm
            ? papi.tx.OmnipoolLiquidityMining.claim_rewards({
                deposit_id: BigInt(farm.depositId),
                yield_farm_id: farm.yieldFarmId,
              })
            : papi.tx.OmnipoolLiquidityMining.withdraw_shares({
                deposit_id: BigInt(farm.depositId),
                yield_farm_id: farm.yieldFarmId,
              })

          omnipoolTxs.push(tx)
        }
      })

      const allTxs = [...omnipoolTxs, ...xykTxs]

      if (allTxs.length === 0) return

      const toasts = {
        submitted: t("liquidity.claimRewards.toast.submitted", {
          value: displayValue,
        }),
        success: t("liquidity.claimRewards.toast.success", {
          value: displayValue,
        }),
        error: t("liquidity.claimRewards.toast.submitted", {
          value: displayValue,
        }),
      }

      const options = {
        onSuccess,
      }

      if (allTxs.length > 1) {
        return await createTransaction(
          {
            tx: papi.tx.Utility.batch_all({
              calls: allTxs.map((t) => t.decodedCall),
            }),
            toasts,
          },
          options,
        )
      } else {
        const tx = allTxs[0]

        if (!tx) throw new Error("Tx not found")

        return await createTransaction(
          {
            tx,
            toasts,
          },
          options,
        )
      }
    },
  })
}
