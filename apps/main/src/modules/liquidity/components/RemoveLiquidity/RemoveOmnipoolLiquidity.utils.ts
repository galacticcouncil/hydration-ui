import {
  calculate_lrna_spot_price,
  calculate_withdrawal_fee,
} from "@galacticcouncil/math-omnipool"
import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import z, { ZodType } from "zod/v4"

import {
  OmnipoolDepositFull,
  omnipoolMiningPositionsKey,
  OmnipoolPosition,
  omnipoolPositionsKey,
} from "@/api/account"
import {
  useMinWithdrawalFee,
  useOmnipoolAssetsData,
  useOraclePrice,
} from "@/api/omnipool"
import { TSelectedAsset } from "@/components/AssetSelect/AssetSelect"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { useAssets } from "@/providers/assetsProvider"
import { Papi, useRpcProvider } from "@/providers/rpcProvider"
import {
  AccountOmnipoolPosition,
  isDepositPosition,
  isOmnipoolDepositPosition,
} from "@/states/account"
import { useOmnipoolPositionData } from "@/states/liquidity"
import { useTradeSettings } from "@/states/tradeSettings"
import { scaleHuman } from "@/utils/formatting"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

import { TReceiveAsset } from "./ReceiveAssets"

export type TRemoveLiquidityFormValues = {
  amount: string
  asset: TSelectedAsset
}

export type RemoveOmnipoolResult = {
  tokensToGet: string
  tokensToGetShifted: string
  minTokensToGet: string
  minTokensToGetShifted: string
  hubToGet: string
  hubPayWith: string
  tokensPayWith: string
  withdrawalFee: string
  minWithdrawalFee: string
}

const defaultRemoveOmnipoolLiquidityValues: RemoveOmnipoolResult = {
  tokensToGet: "0",
  tokensToGetShifted: "0",
  minTokensToGet: "0",
  minTokensToGetShifted: "0",
  hubToGet: "0",
  hubPayWith: "0",
  tokensPayWith: "0",
  withdrawalFee: "0",
  minWithdrawalFee: "0",
}

export const useRemoveOmnipoolLiquidityOut = (poolId: string) => {
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
    ): RemoveOmnipoolResult | undefined => {
      if (!omnipoolAssetData || !oraclePrice || !minWithdrawalFee)
        return undefined

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
          ...defaultRemoveOmnipoolLiquidityValues,
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

      const tokensToGet = valueWithFee.currentValue
      const tokensToGetShifted = valueWithFee.currentValueHuman

      const minTokensToGet = Big(tokensToGet)
        .times(100 - slippage)
        .div(100)
        .toString()

      const minTokensToGetShifted = Big(tokensToGetShifted)
        .times(100 - slippage)
        .div(100)
        .toString()

      return {
        tokensToGet,
        tokensToGetShifted,
        minTokensToGet,
        minTokensToGetShifted,
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
    },
    [getData, minWithdrawalFee, omnipoolAssetData, oraclePrice, slippage],
  )
}

const sumBigStrings = (a: string, b: string): string =>
  Big(a).plus(b).toString()

export const getOmnipoolLiquidityOutTotal = (
  positionsOut: Array<{
    valuesOut?: RemoveOmnipoolResult
    position: AccountOmnipoolPosition
  }>,
) => {
  const total = positionsOut.reduce((acc, { valuesOut }) => {
    if (!valuesOut) return acc

    const {
      tokensToGet,
      tokensToGetShifted,
      minTokensToGet,
      minTokensToGetShifted,
      hubToGet,
      hubPayWith,
      tokensPayWith,
      withdrawalFee,
      minWithdrawalFee,
    } = valuesOut

    return {
      tokensToGet: sumBigStrings(acc.tokensToGet, tokensToGet),
      tokensToGetShifted: sumBigStrings(
        acc.tokensToGetShifted,
        tokensToGetShifted,
      ),
      minTokensToGet: sumBigStrings(acc.minTokensToGet, minTokensToGet),
      minTokensToGetShifted: sumBigStrings(
        acc.minTokensToGetShifted,
        minTokensToGetShifted,
      ),
      hubToGet: sumBigStrings(acc.hubToGet, hubToGet),
      hubPayWith: sumBigStrings(acc.hubPayWith, hubPayWith),
      tokensPayWith: sumBigStrings(acc.tokensPayWith, tokensPayWith),
      withdrawalFee: sumBigStrings(acc.withdrawalFee, withdrawalFee),
      minWithdrawalFee: sumBigStrings(acc.minWithdrawalFee, minWithdrawalFee),
    }
  }, defaultRemoveOmnipoolLiquidityValues)

  return total
}

export const useRemoveSingleOmnipoolPosition = ({
  poolId,
  position,
  onSubmitted,
}: {
  poolId: string
  position: AccountOmnipoolPosition
  onSubmitted: () => void
}) => {
  const { t } = useTranslation("liquidity")
  const { account } = useAccount()
  const { papi } = useRpcProvider()
  const { getAssetWithFallback, hub } = useAssets()
  const meta = getAssetWithFallback(poolId)

  const createBatch = useCreateBatchTx()

  const totalPositionShifted = position.data.currentTotalValueHuman

  const form = useRemoveLiquidityForm({
    asset: meta,
    initialAmount: totalPositionShifted,
    rule: required
      .pipe(positive)
      .check(validateFieldMaxBalance(totalPositionShifted)),
  })

  const amount = form.watch("amount") || "0"

  const calculateLiquidityValues = useRemoveOmnipoolLiquidityOut(poolId)

  const removeShares = Big(amount)
    .div(totalPositionShifted)
    .times(position.shares.toString())
    .toFixed(0)

  const values =
    calculateLiquidityValues(position, removeShares) ??
    defaultRemoveOmnipoolLiquidityValues

  const minAmountOut = values?.minTokensToGet

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
        value: values?.minTokensToGetShifted,
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
        min_limit: BigInt(Big(minAmountOut).toFixed(0)),
      })

      const exitFarmsTxs = isMiningPosition
        ? position.yield_farm_entries.map((entry) =>
            papi.tx.OmnipoolLiquidityMining.withdraw_shares({
              deposit_id: BigInt(position.miningId),
              yield_farm_id: entry.yield_farm_id,
            }),
          )
        : []

      await createBatch({
        txs: isMiningPosition
          ? [...exitFarmsTxs, removeLiquidityTx]
          : [removeLiquidityTx],
        transaction: {
          toasts,
          invalidateQueries: [
            omnipoolPositionsKey(account?.address ?? ""),
            omnipoolMiningPositionsKey(account?.address ?? ""),
          ],
        },
        options: { onSubmitted },
      })
    },
  })

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

  const feesBreakdown = [
    { symbol: meta.symbol, value: values.tokensPayWith, id: meta.id },
  ]

  if (Big(values.hubPayWith).gt(0)) {
    feesBreakdown.push({
      symbol: hub.symbol,
      value: values.hubPayWith,
      id: hub.id,
    })
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

export const useRemoveMultipleOmnipoolPositions = ({
  poolId,
  positions,
  onSubmitted,
}: {
  poolId: string
  positions: AccountOmnipoolPosition[]
  onSubmitted: () => void
}) => {
  const { t } = useTranslation("liquidity")
  const { papi } = useRpcProvider()
  const { getAssetWithFallback, hub } = useAssets()
  const meta = getAssetWithFallback(poolId)
  const { account } = useAccount()

  const createBatch = useCreateBatchTx()
  const form = useRemoveLiquidityForm({
    asset: meta,
  })

  const calculateLiquidityValues = useRemoveOmnipoolLiquidityOut(poolId)

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
      valuesOut: calculateLiquidityValues(position, position.shares.toString()),
    }
  })

  const values = getOmnipoolLiquidityOutTotal(liquidityOutValues)

  const receiveAssets: TReceiveAsset[] = [
    {
      asset: meta,
      value: values.minTokensToGet,
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
        (acc, { position, valuesOut }) => {
          if (!valuesOut) return acc

          if (isOmnipoolDepositPosition(position)) {
            position.yield_farm_entries.forEach((entry) => {
              const tx = papi.tx.OmnipoolLiquidityMining.withdraw_shares({
                deposit_id: BigInt(position.miningId),
                yield_farm_id: entry.yield_farm_id,
              })

              acc.exitingFarmsTxs.push(tx)
            })
          }

          const minAmountOut = valuesOut.minTokensToGet

          acc.liquidityTxs.push(
            papi.tx.Omnipool.remove_liquidity_with_limit({
              amount: position.shares,
              position_id: BigInt(position.positionId),
              min_limit: BigInt(Big(minAmountOut).toFixed(0)),
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

      await createBatch({
        txs,
        transaction: {
          toasts,
          invalidateQueries: [
            omnipoolPositionsKey(account?.address ?? ""),
            omnipoolMiningPositionsKey(account?.address ?? ""),
          ],
        },
        options: { onSubmitted },
      })
    },
  })

  if (!receiveAssets.length) return undefined

  const feesBreakdown = [
    { symbol: meta.symbol, value: values.tokensPayWith, id: meta.id },
  ]

  if (Big(values.hubPayWith).gt(0)) {
    feesBreakdown.push({
      symbol: hub.symbol,
      value: values.hubPayWith,
      id: hub.id,
    })
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
