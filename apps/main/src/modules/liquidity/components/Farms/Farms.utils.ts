import { useMutation, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { wrap } from "comlink"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { prop } from "remeda"

import { OmnipoolDepositFull, XykDeposit } from "@/api/account"
import { useRelayChainBlockNumber } from "@/api/chain"
import { Farm, FarmEntry } from "@/api/farms"
import { useXykPools } from "@/api/pools"
import { getCurrentLoyaltyFactor } from "@/modules/liquidity/components/JoinFarms/JoinFarms.utils"
import { AnyPapiTx } from "@/modules/transactions/types"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  AccountOmnipoolPosition,
  isDepositPosition,
  isXykDepositPosition,
} from "@/states/account"
import { useTransactionsStore } from "@/states/transactions"
import { QUINTILL, RELAY_BLOCK_TIME } from "@/utils/consts"

import type { worker as WorkerType } from "./LoyaltyGraph.worker"
import Worker from "./LoyaltyGraph.worker?worker"

let workerInstance: ReturnType<typeof wrap<typeof WorkerType>> | null = null

export type TJoinedFarm = {
  farm: Farm
  farmEntry: FarmEntry
  period: number
  position: XykDeposit | OmnipoolDepositFull
}

export type TAprByRewardAsset = { rewardAsset: string; totalApr: string }

const getWorker = () => {
  if (!workerInstance) {
    workerInstance = wrap<typeof WorkerType>(new Worker())
  }
  return workerInstance
}

export const useSecondsToLeft = (estimatedEndBlock: string) => {
  const relayChainBlockNumber = useRelayChainBlockNumber()

  return relayChainBlockNumber
    ? Big(estimatedEndBlock)
        .minus(relayChainBlockNumber)
        .times(RELAY_BLOCK_TIME)
        .div(1000)
    : undefined
}

export const useCurrentFarmPeriod = (disableRefetch?: boolean) => {
  const relayChainBlockNumber = useRelayChainBlockNumber(disableRefetch)

  return useCallback(
    (blocksPerPeriod: number) => {
      return relayChainBlockNumber
        ? Big(relayChainBlockNumber).div(blocksPerPeriod).toNumber()
        : undefined
    },
    [relayChainBlockNumber],
  )
}

export const useLoyaltyRates = (farm: Farm, periodsInFarm?: number) => {
  const { loyaltyCurve, globalFarmId, plannedYieldingPeriods, apr } = farm

  return useQuery({
    queryKey: ["loyaltyRates", globalFarmId, periodsInFarm?.toString()],
    queryFn: loyaltyCurve
      ? async () => {
          const periods = Number(plannedYieldingPeriods)
          const initialRewardPercentage = Big(
            loyaltyCurve.initial_reward_percentage.toString(),
          )
            .div(QUINTILL.toString())
            .toNumber()

          const axisScale = periods / 100

          const result = await getWorker().getLoyaltyFactor(
            periods,
            initialRewardPercentage,
            loyaltyCurve.scale_coef,
            periodsInFarm,
            axisScale,
          )

          return result.map((y, x) => ({
            x: new Big(x)
              .div(RELAY_BLOCK_TIME)
              .times(1000)
              .div(60)
              .div(24)
              .times(axisScale)
              .toNumber(),
            y: new Big(y.rate).times(Big(apr).div(100)).toNumber(),
            current: y.current,
          }))
        }
      : undefined,
    enabled: !!loyaltyCurve,
    staleTime: Infinity,
  })
}

export const useDepositAprs = () => {
  const getCurrentFarmPeriod = useCurrentFarmPeriod(true)

  return useCallback(
    (position: AccountOmnipoolPosition | XykDeposit, activeFarms: Farm[]) => {
      const isDeposit = isDepositPosition(position)

      if (!isDeposit || !activeFarms)
        return {
          aprsByRewardAsset: [],
          joinedFarms: [],
          farmsToJoin: activeFarms.filter((farm) => farm.apr !== "0"),
        }

      const joinedFarms: TJoinedFarm[] = []

      const farmsToJoin: Farm[] = []

      for (const farm of activeFarms) {
        const farmEntry = position.yield_farm_entries.find(
          (entry) => entry.global_farm_id === farm.globalFarmId,
        )

        const period = getCurrentFarmPeriod(farm.blocksPerPeriod)

        if (farmEntry && period) {
          joinedFarms.push({
            farm,
            farmEntry,
            period,
            position,
          })
        } else if (farm.apr !== "0") {
          farmsToJoin.push(farm)
        }
      }

      const totalAprs = joinedFarms.reduce(
        (acc, { farm, farmEntry, period }) => {
          const currentPeriodInFarm = Big(period)
            .minus(farmEntry.entered_at)
            .toNumber()

          const currentApr = farm.loyaltyCurve
            ? Big(farm.apr)
                .times(
                  getCurrentLoyaltyFactor(
                    farm.loyaltyCurve,
                    currentPeriodInFarm,
                  ),
                )
                .toString()
            : farm.apr

          const key = String(farm.rewardCurrency)
          const value = currentApr ? Big(currentApr) : Big(0)

          acc[key] = (acc[key] ?? Big(0)).plus(value)

          return acc
        },
        {} as Record<string, Big>,
      )

      const aprsByRewardAsset = Object.entries(totalAprs).map(
        ([rewardAsset, totalApr]) => ({
          rewardAsset,
          totalApr: totalApr.toString(),
        }),
      )

      return { aprsByRewardAsset, joinedFarms, farmsToJoin }
    },
    [getCurrentFarmPeriod],
  )
}

export const useExitDepositFarmsMutation = (
  deposit: XykDeposit | OmnipoolDepositFull,
) => {
  const { t } = useTranslation("liquidity")
  const { papi } = useRpcProvider()
  const createTransaction = useTransactionsStore(prop("createTransaction"))
  const { data: pools } = useXykPools()

  return useMutation({
    mutationFn: async () => {
      const isXYK = isXykDepositPosition(deposit)

      let txs: Array<AnyPapiTx> = []

      if (isXYK) {
        const [assetA, assetB] =
          pools?.find((pool) => pool.address === deposit.amm_pool_id)?.tokens ??
          []

        if (assetA && assetB) {
          txs = deposit.yield_farm_entries.map((entry) => {
            return papi.tx.XYKLiquidityMining.withdraw_shares({
              deposit_id: BigInt(deposit.id),
              yield_farm_id: entry.yield_farm_id,
              asset_pair: {
                asset_in: assetA.id,
                asset_out: assetB.id,
              },
            })
          })
        } else {
          throw new Error("Pool not found")
        }
      } else {
        txs = deposit.yield_farm_entries.map((entry) => {
          return papi.tx.OmnipoolLiquidityMining.withdraw_shares({
            deposit_id: BigInt(deposit.miningId),
            yield_farm_id: entry.yield_farm_id,
          })
        })
      }

      const toasts = {
        submitted: t("liquidity.exitFarms.toast.submitted"),
        success: t("liquidity.exitFarms.toast.success"),
      }

      if (txs.length > 1) {
        const tx = papi.tx.Utility.batch_all({
          calls: txs.map((t) => t.decodedCall),
        })
        return await createTransaction({ tx, toasts })
      }

      const tx = txs[0]

      if (!tx) throw new Error("Tx not found")

      return await createTransaction({ tx, toasts })
    },
  })
}
