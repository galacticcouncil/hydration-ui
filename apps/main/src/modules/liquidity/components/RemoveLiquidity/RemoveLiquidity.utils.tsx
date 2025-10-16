import { calculate_lrna_spot_price } from "@galacticcouncil/math-omnipool"
import { calculate_withdrawal_fee } from "@galacticcouncil/math-omnipool"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { t } from "i18next"
import { useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import z, { ZodType } from "zod/v4"

import { OmnipoolDepositFull } from "@/api/account"
import { OmnipoolPosition } from "@/api/account"
import { TAssetData } from "@/api/assets"
import {
  useMinWithdrawalFee,
  useOmnipoolAssetsData,
  useOraclePrice,
} from "@/api/omnipool"
import { useXYKPoolsLiquidity } from "@/api/xyk"
import { AnyTransaction } from "@/modules/transactions/types"
import { useAssets } from "@/providers/assetsProvider"
import { Papi, useRpcProvider } from "@/providers/rpcProvider"
import {
  isOmnipoolDepositPosition,
  useAccountBalances,
  useAccountOmnipoolPositionsData,
} from "@/states/account"
import { useOmnipoolPositionData, useXYKPool } from "@/states/liquidity"
import { TransactionToasts, useTransactionsStore } from "@/states/transactions"
import { scale, scaleHuman } from "@/utils/formatting"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

export type TRemoveLiquidityFormValues = {
  amount: string
}

type RemoveLiquidityValues = {
  tokensToGet: string
  tokensToGetShifted: string
  hubToGet: string
  hubPayWith: string
  tokensPayWith: string
  withdrawalFee: string
  minWithdrawalFee: string
  receiveAssets: {
    asset: TAssetData
    value: string
  }[]
}

const defaultValues: RemoveLiquidityValues = {
  tokensToGet: "0",
  tokensToGetShifted: "0",
  hubToGet: "0",
  hubPayWith: "0",
  tokensPayWith: "0",
  withdrawalFee: "0",
  minWithdrawalFee: "0",
  receiveAssets: [],
}

export const useRemoveLiquidity = ({
  poolId,
  positionId,
  isRemoveAll,
}: {
  poolId: string
  positionId?: string
  isRemoveAll: boolean
}) => {
  const { papi } = useRpcProvider()
  const { hub, getAssetWithFallback } = useAssets()
  const meta = getAssetWithFallback(poolId)

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

  const omnipoolAssetData = omnipoolAssetsData?.get(Number(poolId))

  const removePosition = omnipoolPositions.find(
    (position) => position.positionId === positionId,
  )

  const totalPosition = removePosition
    ? scaleHuman(removePosition.data.currentTotalValue, meta.decimals)
    : undefined

  const form = useRemoveLiquidityForm({
    initialAmount: totalPosition,
    rule:
      !isRemoveAll && totalPosition
        ? required.pipe(positive).check(validateFieldMaxBalance(totalPosition))
        : undefined,
  })

  const amount = form.watch("amount") || "0"

  const { removeShares, totalValue, balance } = useMemo(() => {
    if (isRemoveAll) {
      let totalShares = Big(0)
      let totalValue = Big(0)

      for (const position of omnipoolPositions) {
        totalShares = totalShares.plus(position.shares.toString())
        totalValue = totalValue.plus(position.data.currentTotalValueHuman)
      }

      return {
        totalValue: totalValue.toString(),
        balance: totalValue.toString(),
        removeShares: totalShares.toString(),
      }
    } else if (removePosition) {
      const balance = scaleHuman(
        removePosition.data.currentTotalValue,
        meta.decimals,
      )

      const removeShares = Big(amount)
        .div(balance)
        .times(removePosition.shares.toString())
        .toFixed(0)

      return {
        balance,
        totalValue: removePosition.data.currentTotalValueHuman,
        removeShares,
      }
    } else {
      return {
        totalValue: "0",
        balance: "0",
        removeShares: "0",
      }
    }
  }, [omnipoolPositions, isRemoveAll, removePosition, meta.decimals, amount])

  const calculateLiquidityValues = useCallback(
    (
      position: OmnipoolPosition | OmnipoolDepositFull,
      removeSharesValue: string,
    ) => {
      if (omnipoolAssetData && oraclePrice && minWithdrawalFee) {
        const lrnaSpotPrice = calculate_lrna_spot_price(
          omnipoolAssetData.balance.toString(),
          omnipoolAssetData.hubReserves.toString(),
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
          receiveAssets: [
            {
              asset: meta,
              value: valueWithFee.currentValueHuman,
            },

            ...(Big(valueWithFee.currentHubValueHuman).gt(0)
              ? [
                  {
                    asset: hub,
                    value: valueWithFee.currentHubValueHuman,
                  },
                ]
              : []),
          ],
        }
      }
    },
    [getData, minWithdrawalFee, omnipoolAssetData, oraclePrice, hub, meta],
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
            receiveAssets: values.receiveAssets,
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

  if (!values || !values.receiveAssets.length) return undefined

  return {
    removeShares,
    totalValue,
    fee: values.withdrawalFee,
    receiveAssets: values.receiveAssets,
    mutation,
    balance,
    form,
    meta,
    logoId: meta.id,
  }
}

export const useRemoveIsolatedLiquidity = ({
  poolId,
  positionId,
  shareTokenId,
  isRemoveAll,
}: {
  poolId: string
  positionId?: string
  shareTokenId?: string
  isRemoveAll: boolean
}) => {
  const { papi } = useRpcProvider()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const { data: pool } = useXYKPool(poolId)

  const { getAssetWithFallback } = useAssets()

  const { data: liquidity } = useXYKPoolsLiquidity(poolId)

  const { getFreeBalance } = useAccountBalances()

  const balance = shareTokenId ? getFreeBalance(shareTokenId).toString() : "0"
  const balanceShifted = scaleHuman(balance, pool?.meta.decimals ?? 0)

  const positions = pool?.positions ?? []
  const position = positions.find((position) => position.id === positionId)

  const form = useRemoveLiquidityForm({
    initialAmount: balanceShifted,
    rule:
      !isRemoveAll && balanceShifted
        ? required.pipe(positive).check(validateFieldMaxBalance(balanceShifted))
        : undefined,
  })

  let removeSharesAmount = "0"

  if (isRemoveAll) {
    removeSharesAmount = positions
      .reduce((acc, pos) => acc.plus(pos.shares.toString()), Big(0))
      .toString()
  } else if (pool) {
    removeSharesAmount = scale(form.watch("amount"), pool.meta.decimals)
  }

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const [assetA, assetB] = pool?.tokens ?? []

      if (!pool || !assetA || !assetB) throw new Error("Pool not found")

      let tx: AnyTransaction | undefined
      let toasts: TransactionToasts = {
        submitted: t("liquidity:liquidity.remove.modal.xyk.toast.submitted", {
          value: removeSharesAmount,
        }),
        success: t("liquidity:liquidity.remove.modal.xyk.toast.success", {
          value: removeSharesAmount,
        }),
        error: t("liquidity:liquidity.remove.modal.xyk.toast.submitted", {
          value: removeSharesAmount,
        }),
      }

      if (isRemoveAll) {
        const { liquidityTxs, exitingFarmsTxs } = positions.reduce<{
          liquidityTxs: ReturnType<Papi["tx"]["XYK"]["remove_liquidity"]>[]
          exitingFarmsTxs: ReturnType<
            Papi["tx"]["XYKLiquidityMining"]["withdraw_shares"]
          >[]
        }>(
          (acc, position) => {
            position.yield_farm_entries.forEach((entry) => {
              const tx = papi.tx.XYKLiquidityMining.withdraw_shares({
                deposit_id: BigInt(position.id),
                yield_farm_id: entry.yield_farm_id,
                asset_pair: {
                  asset_in: Number(assetA.id),
                  asset_out: Number(assetB.id),
                },
              })

              acc.exitingFarmsTxs.push(tx)
            })

            acc.liquidityTxs.push(
              papi.tx.XYK.remove_liquidity({
                asset_a: Number(assetA.id),
                asset_b: Number(assetB.id),
                share_amount: BigInt(position.shares.toString()),
              }),
            )

            return acc
          },
          { liquidityTxs: [], exitingFarmsTxs: [] },
        )

        toasts = {
          submitted: t(
            "liquidity:liquidity.remove.modal.xyk.all.toast.submitted",
          ),
          success: t("liquidity:liquidity.remove.modal.xyk.all.toast.success"),
          error: t("liquidity:liquidity.remove.modal.xyk.all.toast.submitted"),
        }

        tx = papi.tx.Utility.batch_all({
          calls: [...exitingFarmsTxs, ...liquidityTxs].map(
            (t) => t.decodedCall,
          ),
        })
      } else if (position) {
        const exitFarmsTxs = position.yield_farm_entries.map((entry) =>
          papi.tx.XYKLiquidityMining.withdraw_shares({
            deposit_id: BigInt(position.id),
            yield_farm_id: entry.yield_farm_id,
            asset_pair: {
              asset_in: Number(assetA.id),
              asset_out: Number(assetB.id),
            },
          }),
        )

        const removeLiquidityTx = papi.tx.XYK.remove_liquidity({
          asset_a: Number(assetA.id),
          asset_b: Number(assetB.id),
          share_amount: BigInt(position.shares.toString()),
        })

        tx = papi.tx.Utility.batch_all({
          calls: [...exitFarmsTxs, removeLiquidityTx].map((t) => t.decodedCall),
        })
      } else {
        tx = papi.tx.XYK.remove_liquidity({
          asset_a: assetA.id,
          asset_b: assetB.id,
          share_amount: BigInt(Big(removeSharesAmount).toFixed(0)),
        })
      }

      if (tx) {
        await createTransaction({
          tx,
          toasts,
        })
      }
    },
  })

  if (!pool || !liquidity) return undefined

  const receiveAssets = pool.tokens.map((token) => {
    const tokenTotalBalance = token.balance

    const value = scaleHuman(
      Big(tokenTotalBalance.toString())
        .times(removeSharesAmount)
        .div(liquidity.toString())
        .toString(),
      token.decimals ?? 0,
    )

    const asset = getAssetWithFallback(token.id)

    return {
      asset,
      value,
    }
  })

  return {
    receiveAssets,
    totalValue: scaleHuman(removeSharesAmount, pool.meta.decimals),
    balance: scaleHuman(balance, pool.meta.decimals),
    mutation,
    form,
    meta: pool.meta,
    logoId: pool.meta.iconId,
  }
}

export const useRemoveLiquidityForm = ({
  initialAmount,
  rule,
}: {
  initialAmount?: string
  rule?: ZodType<string, string> | undefined
}) => {
  return useForm<TRemoveLiquidityFormValues>({
    mode: "onChange",
    defaultValues: { amount: initialAmount ?? "" },
    resolver: rule
      ? standardSchemaResolver(z.object({ amount: rule }))
      : undefined,
  })
}
