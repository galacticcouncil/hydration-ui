import { calculate_lrna_spot_price } from "@galacticcouncil/math-omnipool"
import { calculate_withdrawal_fee } from "@galacticcouncil/math-omnipool"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { t } from "i18next"
import { useCallback, useMemo } from "react"

import { OmnipoolDepositFull } from "@/api/account"
import { OmnipoolPosition } from "@/api/account"
import {
  useMinWithdrawalFee,
  useOmnipoolAssetsData,
  useOraclePrice,
} from "@/api/omnipool"
import { useAssets } from "@/providers/assetsProvider"
import { Papi, useRpcProvider } from "@/providers/rpcProvider"
import {
  isOmnipoolDepositPosition,
  useAccountOmnipoolPositionsData,
} from "@/states/account"
import { useOmnipoolPositionData } from "@/states/liquidity"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

type RemoveLiquidityValues = {
  tokensToGet: string
  tokensToGetShifted: string
  hubToGet: string
  hubPayWith: string
  tokensPayWith: string
  withdrawalFee: string
  minWithdrawalFee: string
}

const defaultValues: RemoveLiquidityValues = {
  tokensToGet: "0",
  tokensToGetShifted: "0",
  hubToGet: "0",
  hubPayWith: "0",
  tokensPayWith: "0",
  withdrawalFee: "0",
  minWithdrawalFee: "0",
}

export const getIsRemoveAll = (positionId: string) => positionId === "all"

export const useRemoveLiquidity = (
  percentage: number,
  poolId: string,
  positionId: string,
) => {
  const { hub, getAssetWithFallback } = useAssets()
  const meta = getAssetWithFallback(poolId)

  const { papi } = useRpcProvider()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  const { data: oraclePriceData } = useOraclePrice(
    Number(meta.id),
    Number(hub.id),
  )
  const oraclePrice = oraclePriceData?.oraclePrice

  const { dataMap: omnipoolAssetsData } = useOmnipoolAssetsData()
  const { data: minWithdrawalFee } = useMinWithdrawalFee()

  const { getData } = useOmnipoolPositionData()
  const { getAssetPositions } = useAccountOmnipoolPositionsData()
  const { all: omnipoolPositions } = getAssetPositions(poolId)

  const omnipoolAssetData = omnipoolAssetsData?.get(poolId)
  const isRemoveAll = getIsRemoveAll(positionId)

  const removePosition = omnipoolPositions.find(
    (position) => position.positionId === positionId,
  )

  const { removeShares, totalValue, remainingValue, removeValue } =
    useMemo(() => {
      if (isRemoveAll) {
        const totalShares = omnipoolPositions.reduce(
          (acc, pos) => Big(acc).plus(pos.shares.toString()).toString(),
          "0",
        )

        const totalRemoveValue = omnipoolPositions.reduce(
          (acc, pos) =>
            Big(acc)
              .plus(pos.data?.currentTotalValueHuman ?? "0")
              .toString(),
          "0",
        )
        return {
          removeShares: totalShares,
          removeValue: totalRemoveValue,
          totalValue: totalRemoveValue,
          remainingValue: "0",
        }
      }

      if (!removePosition || !removePosition.data) {
        return {
          removeShares: "0",
          removeValue: "0",
          totalValue: "0",
          remainingValue: "0",
        }
      }

      const totalShares = removePosition.shares
      const removeValue = Big(removePosition.data.currentTotalValueHuman)
        .div(100)
        .times(percentage)
        .toString()
      const remainingValue = Big(removePosition.data.currentTotalValueHuman)
        .minus(removeValue)
        .toString()

      return {
        totalValue: removePosition.data.currentTotalValueHuman,
        removeValue,
        remainingValue,
        removeShares: Big(totalShares.toString())
          .div(100)
          .times(percentage)
          .toFixed(0),
      }
    }, [omnipoolPositions, percentage, isRemoveAll, removePosition])

  const calculateLiquidityValues = useCallback(
    (
      position: OmnipoolPosition | OmnipoolDepositFull,
      removeSharesValue: string,
    ) => {
      if (omnipoolAssetData && oraclePrice && minWithdrawalFee) {
        const lrnaSpotPrice = calculate_lrna_spot_price(
          omnipoolAssetData.balance,
          omnipoolAssetData.hubReserve,
        )

        const withdrawalFee = calculate_withdrawal_fee(
          lrnaSpotPrice,
          oraclePrice.toString(),
          minWithdrawalFee.toString(),
        )

        if (!removeSharesValue) {
          return {
            ...defaultValues,
            withdrawalFee: Big(scaleHuman(withdrawalFee, "q"))
              .times(100)
              .toString(),
            minWithdrawalFee: minWithdrawalFee.toString(),
          }
        }

        const valueWithFee = getData(position, {
          fee: withdrawalFee,
          sharesValue: removeSharesValue,
        })

        const valueWithoutFee = getData(position, {
          sharesValue: removeSharesValue,
        })

        if (!valueWithFee || !valueWithoutFee) return undefined

        return {
          tokensToGet: valueWithFee.currentValue,
          tokensToGetShifted: valueWithFee.currentValueHuman,
          hubToGet: valueWithFee.currentHubValueHuman,
          hubPayWith: Big(valueWithoutFee.currentHubValueHuman)
            .minus(valueWithFee.currentHubValueHuman)
            .toString(),
          tokensPayWith: Big(valueWithoutFee.currentValueHuman)
            .minus(valueWithFee.currentValueHuman)
            .toString(),
          withdrawalFee: Big(scaleHuman(withdrawalFee, "q"))
            .times(100)
            .toString(),
          minWithdrawalFee: minWithdrawalFee.toString(),
        }
      }
    },
    [getData, minWithdrawalFee, omnipoolAssetData, oraclePrice],
  )

  const values = useMemo(() => {
    if (isRemoveAll) {
      return omnipoolPositions.reduce<RemoveLiquidityValues>((acc, pos) => {
        const values = calculateLiquidityValues(pos, pos.shares.toString())

        if (values) {
          return {
            tokensToGet: Big(acc.tokensToGet)
              .plus(values.tokensToGet)
              .toString(),
            tokensToGetShifted: Big(acc.tokensToGetShifted)
              .plus(values.tokensToGetShifted)
              .toString(),
            hubToGet: Big(acc.hubToGet).plus(values.hubToGet).toString(),
            hubPayWith: Big(acc.hubPayWith).plus(values.hubPayWith).toString(),
            tokensPayWith: Big(acc.tokensPayWith)
              .plus(values.tokensPayWith)
              .toString(),
            withdrawalFee: values.withdrawalFee,
            minWithdrawalFee: values.minWithdrawalFee,
          }
        }

        return acc
      }, defaultValues)
    }

    if (!removePosition) return defaultValues

    return calculateLiquidityValues(removePosition, removeShares)
  }, [
    calculateLiquidityValues,
    isRemoveAll,
    removeShares,
    omnipoolPositions,
    removePosition,
  ])

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (isRemoveAll) {
        const { liquidityTxs, exitingFarmsTxs } = omnipoolPositions.reduce<{
          liquidityTxs: ReturnType<Papi["tx"]["Omnipool"]["remove_liquidity"]>[]
          exitingFarmsTxs: ReturnType<
            Papi["tx"]["OmnipoolLiquidityMining"]["withdraw_shares"]
          >[]
        }>(
          (acc, position) => {
            if (isOmnipoolDepositPosition(position)) {
              position.yield_farm_entries.forEach((entry) => {
                const tx = papi.tx.OmnipoolLiquidityMining.withdraw_shares({
                  deposit_id: BigInt(position.miningId),
                  yield_farm_id: entry.yield_farm_id,
                })

                acc.exitingFarmsTxs.push(tx)
              })
            }

            acc.liquidityTxs.push(
              papi.tx.Omnipool.remove_liquidity({
                amount: position.shares,
                position_id: BigInt(position.positionId),
              }),
            )

            return acc
          },
          { liquidityTxs: [], exitingFarmsTxs: [] },
        )

        const txs = [...exitingFarmsTxs, ...liquidityTxs]

        const toasts = {
          submitted: t("liquidity:liquidity.remove.modal.all.toast.submitted"),
          success: t("liquidity:liquidity.remove.modal.all.toast.success"),
          error: t("liquidity:liquidity.remove.modal.all.toast.submitted"),
        }

        if (txs.length > 1) {
          await createTransaction({
            tx: papi.tx.Utility.batch_all({
              calls: txs.map((t) => t.decodedCall),
            }),
            toasts,
          })
        } else {
          const tx = txs[0]

          if (!tx) return
          await createTransaction({
            tx,
            toasts,
          })
        }
      } else if (removePosition) {
        const isMiningPosition = isOmnipoolDepositPosition(removePosition)

        const hub =
          values?.hubToGet && values.hubToGet !== "0"
            ? t("liquidity:liquidity.remove.modal.toast.hub", {
                value: values.hubToGet,
              })
            : undefined

        const tOptions = {
          value: values?.tokensToGetShifted,
          symbol: meta.symbol,
          hub,
        }

        const toasts = {
          submitted: t(
            "liquidity:liquidity.remove.modal.toast.submitted",
            tOptions,
          ),
          success: t(
            "liquidity:liquidity.remove.modal.toast.success",
            tOptions,
          ),
          error: t(
            "liquidity:liquidity.remove.modal.toast.submitted",
            tOptions,
          ),
        }

        const removeLiquidityTx = papi.tx.Omnipool.remove_liquidity({
          amount: BigInt(removeShares),
          position_id: BigInt(removePosition.positionId),
        })

        const exitFarmsTxs = isMiningPosition
          ? removePosition.yield_farm_entries.map((entry) =>
              papi.tx.OmnipoolLiquidityMining.withdraw_shares({
                deposit_id: BigInt(removePosition.miningId),
                yield_farm_id: entry.yield_farm_id,
              }),
            )
          : []

        const tx = isMiningPosition
          ? papi.tx.Utility.batch_all({
              calls: [...exitFarmsTxs, removeLiquidityTx].map(
                (t) => t.decodedCall,
              ),
            })
          : removeLiquidityTx

        await createTransaction({
          tx,
          toasts,
        })
      }
    },
  })

  return {
    removeShares,
    totalValue,
    remainingValue,
    removeValue,
    values,
    mutation,
  }
}
