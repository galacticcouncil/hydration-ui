import {
  calculate_lrna_spot_price,
  calculate_withdrawal_fee,
} from "@galacticcouncil/math-omnipool"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { prop } from "remeda"
import z, { ZodType } from "zod/v4"

import { OmnipoolDepositFull, OmnipoolPosition } from "@/api/account"
import {
  useMinWithdrawalFee,
  useOmnipoolAssetsData,
  useOraclePrice,
} from "@/api/omnipool"
import { TSelectedAsset } from "@/components/AssetSelect/AssetSelect"
import { useAssets } from "@/providers/assetsProvider"
import { Papi, useRpcProvider } from "@/providers/rpcProvider"
import {
  AccountOmnipoolPosition,
  isDepositPosition,
  isOmnipoolDepositPosition,
} from "@/states/account"
import { useOmnipoolPositionData } from "@/states/liquidity"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

import { TReceiveAsset } from "./ReceiveAssets"

export type TRemoveLiquidityFormValues = {
  amount: string
  asset: TSelectedAsset
}

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

const useRemoveLiquidityOut = (poolId: string) => {
  const { hub, getAssetWithFallback } = useAssets()
  const meta = getAssetWithFallback(poolId)
  const { data: oraclePriceData } = useOraclePrice(
    Number(meta.id),
    Number(hub.id),
  )
  const {
    liquidity: { slippage },
  } = useTradeSettings()

  const { dataMap: omnipoolAssetsData } = useOmnipoolAssetsData()
  const { data: minWithdrawalFee } = useMinWithdrawalFee()
  const { getData } = useOmnipoolPositionData()

  const omnipoolAssetData = omnipoolAssetsData?.get(Number(poolId))
  const oraclePrice = oraclePriceData?.oraclePrice

  return useCallback(
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

        const tokensToGet = Big(valueWithFee.currentValue)
          .times(100 - slippage)
          .div(100)
          .toFixed(0)

        const tokensToGetShifted = Big(valueWithFee.currentValueHuman)
          .times(100 - slippage)
          .div(100)
          .toFixed(0)

        return {
          tokensToGet,
          tokensToGetShifted,
          hubToGet: valueWithFee.currentHubValue,
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
    [getData, minWithdrawalFee, omnipoolAssetData, oraclePrice, slippage],
  )
}

export const useRemoveSingleOmnipoolPosition = (
  poolId: string,
  position: AccountOmnipoolPosition,
) => {
  const { t } = useTranslation("liquidity")
  const { papi } = useRpcProvider()
  const { getAssetWithFallback, hub } = useAssets()
  const meta = getAssetWithFallback(poolId)

  const createTransaction = useTransactionsStore(prop("createTransaction"))

  const totalPositionShifted = position.data.currentTotalValueHuman

  const form = useRemoveLiquidityForm({
    asset: meta,
    initialAmount: totalPositionShifted,
    rule: required
      .pipe(positive)
      .check(validateFieldMaxBalance(totalPositionShifted)),
  })

  const amount = form.watch("amount") || "0"

  const calculateLiquidityValues = useRemoveLiquidityOut(poolId)

  const removeShares = Big(amount)
    .div(totalPositionShifted)
    .times(position.shares.toString())
    .toFixed(0)

  const values = calculateLiquidityValues(position, removeShares)

  const minAmountOut = values?.tokensToGet

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!minAmountOut) throw new Error("Min amount is not defined")

      const isMiningPosition = isOmnipoolDepositPosition(position)

      const hubValue =
        values?.hubToGet && values.hubToGet !== "0"
          ? t("liquidity.remove.modal.toast.hub", {
              value: scaleHuman(values.hubToGet, hub.decimals),
            })
          : undefined

      const tOptions = {
        value: values?.tokensToGetShifted,
        symbol: meta.symbol,
        hub: hubValue,
      }

      const toasts = {
        submitted: t("liquidity.remove.modal.toast.submitted", tOptions),
        success: t("liquidity.remove.modal.toast.success", tOptions),
      }

      const removeLiquidityTx = papi.tx.Omnipool.remove_liquidity_with_limit({
        position_id: BigInt(position.positionId),
        amount: BigInt(removeShares),
        min_limit: BigInt(minAmountOut),
      })

      const exitFarmsTxs = isMiningPosition
        ? position.yield_farm_entries.map((entry) =>
            papi.tx.OmnipoolLiquidityMining.withdraw_shares({
              deposit_id: BigInt(position.miningId),
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
    },
  })

  if (!values || !minAmountOut) return undefined

  const receiveAssets: TReceiveAsset[] = [
    {
      asset: meta,
      value: minAmountOut,
    },
  ]

  if (Big(values.hubToGet).gt(0)) {
    receiveAssets.push({
      asset: hub,
      value: values.hubToGet,
    })
  }

  const feesBreakdown = [{ symbol: meta.symbol, value: values.tokensPayWith }]

  if (Big(values.hubPayWith).gt(0)) {
    feesBreakdown.push({ symbol: hub.symbol, value: values.hubPayWith })
  }

  const isDeposit = isDepositPosition(position)

  return {
    removeShares,
    totalPositionShifted,
    fee: values.withdrawalFee,
    receiveAssets,
    feesBreakdown,
    mutation,
    form,
    meta,
    deposits: isDeposit ? [position] : undefined,
    editable: !isDeposit,
  }
}

export const useRemoveMultipleOmnipoolPositions = (
  poolId: string,
  positions: AccountOmnipoolPosition[],
) => {
  const { t } = useTranslation("liquidity")
  const { papi } = useRpcProvider()
  const { getAssetWithFallback, hub } = useAssets()
  const meta = getAssetWithFallback(poolId)

  const createTransaction = useTransactionsStore(prop("createTransaction"))

  const form = useRemoveLiquidityForm({
    asset: meta,
  })

  const calculateLiquidityValues = useRemoveLiquidityOut(poolId)

  let removeShares = Big(0)
  let totalPositionShifted = Big(0)

  for (const position of positions) {
    removeShares = removeShares.plus(position.shares.toString())
    totalPositionShifted = totalPositionShifted.plus(
      position.data.currentTotalValueHuman,
    )
  }

  const liquidityOutValues = positions.map((position) => {
    return {
      position,
      values: calculateLiquidityValues(position, position.shares.toString()),
    }
  })

  const values = liquidityOutValues.reduce<RemoveLiquidityValues>(
    (acc, { values }) => {
      if (values) {
        return {
          tokensToGet: Big(acc.tokensToGet).plus(values.tokensToGet).toString(),
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
    },
    defaultValues,
  )

  const receiveAssets: TReceiveAsset[] = [
    {
      asset: meta,
      value: values.tokensToGet,
    },
  ]

  if (Big(values.hubToGet).gt(0)) {
    receiveAssets.push({
      asset: hub,
      value: values.hubToGet,
    })
  }

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const { liquidityTxs, exitingFarmsTxs } = liquidityOutValues.reduce<{
        liquidityTxs: ReturnType<
          Papi["tx"]["Omnipool"]["remove_liquidity_with_limit"]
        >[]
        exitingFarmsTxs: ReturnType<
          Papi["tx"]["OmnipoolLiquidityMining"]["withdraw_shares"]
        >[]
      }>(
        (acc, { position, values }) => {
          if (!values) return acc

          if (isOmnipoolDepositPosition(position)) {
            position.yield_farm_entries.forEach((entry) => {
              const tx = papi.tx.OmnipoolLiquidityMining.withdraw_shares({
                deposit_id: BigInt(position.miningId),
                yield_farm_id: entry.yield_farm_id,
              })

              acc.exitingFarmsTxs.push(tx)
            })
          }

          const minAmountOut = values.tokensToGet

          acc.liquidityTxs.push(
            papi.tx.Omnipool.remove_liquidity_with_limit({
              amount: position.shares,
              position_id: BigInt(position.positionId),
              min_limit: BigInt(minAmountOut),
            }),
          )

          return acc
        },
        { liquidityTxs: [], exitingFarmsTxs: [] },
      )

      const txs = [...exitingFarmsTxs, ...liquidityTxs]

      const toasts = {
        submitted: t("liquidity.remove.modal.all.toast.submitted"),
        success: t("liquidity.remove.modal.all.toast.success"),
        error: t("liquidity.remove.modal.all.toast.submitted"),
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
    },
  })

  if (!receiveAssets.length) return undefined

  const feesBreakdown = [{ symbol: meta.symbol, value: values.tokensPayWith }]

  if (Big(values.hubPayWith).gt(0)) {
    feesBreakdown.push({ symbol: hub.symbol, value: values.hubPayWith })
  }

  return {
    removeShares: removeShares.toString(),
    totalPositionShifted: totalPositionShifted.toString(),
    fee: values.withdrawalFee,
    feesBreakdown,
    receiveAssets,
    mutation,
    form,
    meta,
    deposits: positions.filter((pos) => isDepositPosition(pos)),
  }
}

export const useRemoveLiquidityForm = ({
  asset,
  initialAmount,
  rule,
}: {
  asset?: TSelectedAsset
  initialAmount?: string
  rule?: ZodType<string, string> | undefined
}) => {
  return useForm<TRemoveLiquidityFormValues>({
    mode: "onChange",
    defaultValues: { amount: initialAmount ?? "", asset },
    resolver: rule
      ? standardSchemaResolver(
          z.object({ amount: rule, asset: z.custom<TSelectedAsset>() }),
        )
      : undefined,
  })
}
