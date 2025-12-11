import { useOraclePrice } from "api/farms"
import { useOmnipoolDataObserver } from "api/omnipool"
import { useRpcProvider } from "providers/rpcProvider"
import { useCallback, useMemo } from "react"
import { BN_0, BN_100, MIN_WITHDRAWAL_FEE } from "utils/constants"
import BN from "bignumber.js"
import {
  calculate_lrna_spot_price,
  calculate_withdrawal_fee,
} from "@galacticcouncil/math-omnipool"
import { scale, scaleHuman } from "utils/balance"
import { useMinWithdrawalFee } from "api/consts"
import { useMutation } from "@tanstack/react-query"
import { ToastMessage, useStore } from "state/store"
import { TOAST_MESSAGES } from "state/toasts"
import { Trans, useTranslation } from "react-i18next"
import { TLPData, useLiquidityPositionData } from "utils/omnipool"
import { useAssets } from "providers/assets"
import { usePoolData } from "sections/pools/pool/Pool"
import { useCreateBatchTx } from "sections/transaction/ReviewTransaction.utils"
import { useLiquidityLimit } from "state/liquidityLimit"

export type RemoveLiquidityProps = {
  onClose: () => void
  position: TLPData | TLPData[]
  onSuccess: () => void
  onSubmitted?: (tokensToGet: string) => void
  onError?: () => void
  setLiquidityLimit: () => void
}

type TLiquidityOut = {
  tokensToGet: BN
  tokensToGetShifted: BN
  lrnaToGet: BN
  lrnaToGetShifted: BN
  lrnaPayWith: BN
  tokensPayWith: BN
  withdrawalFee: BN
  minWithdrawalFee: BN
}

const defaultValues = {
  tokensToGet: BN_0,
  tokensToGetShifted: BN_0,
  lrnaToGet: BN_0,
  lrnaToGetShifted: BN_0,
  lrnaPayWith: BN_0,
  tokensPayWith: BN_0,
  withdrawalFee: BN_0,
  minWithdrawalFee: BN_0,
}

const useMinSharesToGet = () => {
  const { addLiquidityLimit } = useLiquidityLimit()

  return (sharesToGet: BN) =>
    sharesToGet.times(BN_100.minus(addLiquidityLimit).div(BN_100)).toFixed(0)
}

export const useRemoveLiquidity = (
  position: TLPData | TLPData[],
  percentage: number,
  onClose: () => void,
  onSuccess: () => void,
  onSubmit: (value: string) => void,
  onError?: () => void,
) => {
  const { t } = useTranslation()
  const { createTransaction } = useStore()
  const { api } = useRpcProvider()
  const { hub } = useAssets()
  const { pool } = usePoolData()
  const { createBatch } = useCreateBatchTx()
  const getMinSharesToGet = useMinSharesToGet()

  const isPositionMultiple = Array.isArray(position)

  const assetId = pool.id

  const meta = pool.meta
  const hubMeta = hub

  const { data: oracle } = useOraclePrice(assetId, hubMeta.id)
  const { data: minlFeeQuery } = useMinWithdrawalFee()
  const { getData } = useLiquidityPositionData([assetId])
  const omnipoolAssets = useOmnipoolDataObserver()
  const omnipoolAsset = omnipoolAssets.dataMap?.get(assetId)

  const { removeShares, totalValue, remainingValue, removeValue } =
    useMemo(() => {
      if (isPositionMultiple) {
        const totalShares = position.reduce(
          (acc, pos) => acc.plus(pos.shares),
          BN_0,
        )

        const totalRemoveValue = position.reduce(
          (acc, pos) => acc.plus(pos.totalValueShifted),
          BN_0,
        )
        return {
          removeShares: totalShares,
          removeValue: totalRemoveValue,
          totalValue: totalRemoveValue,
          remainingValue: BN_0,
        }
      }

      const totalShares = position.shares
      const removeValue = position.totalValue.div(100).times(percentage)
      const remainingValue = position.totalValue.minus(removeValue)

      return {
        totalValue: position.totalValueShifted,
        removeValue: removeValue.shiftedBy(-meta.decimals),
        remainingValue: remainingValue.shiftedBy(-meta.decimals),
        removeShares: BN(totalShares).div(100).times(percentage),
      }
    }, [meta, isPositionMultiple, position, percentage])

  const calculateLiquidityValues = useCallback(
    (position: TLPData, removeSharesValue: BN): TLiquidityOut | undefined => {
      if (omnipoolAsset && oracle && minlFeeQuery) {
        const oraclePrice = oracle.oraclePrice ?? BN_0
        const minWithdrawalFee = minlFeeQuery

        const lrnaSpotPrice = calculate_lrna_spot_price(
          omnipoolAsset.balance,
          omnipoolAsset.hubReserve,
        )

        const withdrawalFee = pool.canAddLiquidity
          ? calculate_withdrawal_fee(
              lrnaSpotPrice,
              oraclePrice.toString(),
              minWithdrawalFee.toString(),
            )
          : scale(MIN_WITHDRAWAL_FEE, "q").toString()

        if (removeSharesValue.isZero()) {
          return {
            ...defaultValues,
            withdrawalFee: scaleHuman(withdrawalFee, "q").multipliedBy(100),
            minWithdrawalFee,
          }
        }

        const valueWithFee = getData(position, {
          fee: withdrawalFee,
          sharesValue: removeSharesValue.toFixed(0),
        })

        const valueWithoutFee = getData(position, {
          sharesValue: removeSharesValue.toFixed(0),
        })

        if (!valueWithFee || !valueWithoutFee) return undefined

        return {
          tokensToGet: valueWithFee.value,
          tokensToGetShifted: valueWithFee.valueShifted,
          lrnaToGetShifted: valueWithFee.lrnaShifted,
          lrnaToGet: valueWithFee.lrna,
          lrnaPayWith: valueWithoutFee.lrnaShifted.minus(
            valueWithFee.lrnaShifted,
          ),
          tokensPayWith: valueWithoutFee.valueShifted.minus(
            valueWithFee.valueShifted,
          ),
          withdrawalFee: scaleHuman(withdrawalFee, "q").multipliedBy(100),
          minWithdrawalFee,
        }
      }
    },
    [getData, minlFeeQuery, omnipoolAsset, oracle, pool.canAddLiquidity],
  )

  const { values, liquidityOut } = useMemo(() => {
    if (isPositionMultiple) {
      const { liquidityOut, values } = position.reduce<{
        liquidityOut: Array<{ position: TLPData; liquidityOut: TLiquidityOut }>
        values: TLiquidityOut
      }>(
        (acc, pos) => {
          const values = calculateLiquidityValues(pos, BN(pos.shares))

          if (values) {
            acc.liquidityOut.push({ position: pos, liquidityOut: values })
            return {
              liquidityOut: acc.liquidityOut,
              values: {
                tokensToGet: acc.values.tokensToGet.plus(values.tokensToGet),
                tokensToGetShifted: acc.values.tokensToGetShifted.plus(
                  values.tokensToGetShifted,
                ),
                lrnaToGetShifted: acc.values.lrnaToGetShifted.plus(
                  values.lrnaToGetShifted,
                ),
                lrnaToGet: acc.values.lrnaToGet.plus(values.lrnaToGet),
                lrnaPayWith: acc.values.lrnaPayWith.plus(values.lrnaPayWith),
                tokensPayWith: acc.values.tokensPayWith.plus(
                  values.tokensPayWith,
                ),
                withdrawalFee: values.withdrawalFee,
                minWithdrawalFee: values.minWithdrawalFee,
              },
            }
          }

          return acc
        },
        {
          values: defaultValues,
          liquidityOut: [],
        },
      )

      return {
        values,
        liquidityOut,
      }
    }

    const values = calculateLiquidityValues(position, removeShares)

    return {
      values,
      liquidityOut: [
        {
          position: position,
          liquidityOut: values ?? defaultValues,
        },
      ],
    }
  }, [calculateLiquidityValues, isPositionMultiple, position, removeShares])

  const mutation = useMutation(async () => {
    if (isPositionMultiple) {
      if (!values || liquidityOut.length === 0) return null

      const toast = TOAST_MESSAGES.reduce((memo, type) => {
        const msType = type === "onError" ? "onLoading" : type
        memo[type] = (
          <Trans t={t} i18nKey={`liquidity.remove.modal.all.toast.${msType}`}>
            <span />
          </Trans>
        )
        return memo
      }, {} as ToastMessage)

      const transactionOptions = {
        toast,
        onBack: () => null,
        onClose,
        onSuccess,
        onSubmitted: () => onSubmit(values.tokensToGet.toString()),
        onError,
      }

      const txs = liquidityOut.map(({ position, liquidityOut }) => {
        const shares = BN(position.shares)
        const minShares = getMinSharesToGet(liquidityOut.tokensToGet)

        return api.tx.omnipool.removeLiquidityWithLimit(
          position.id,
          shares.toFixed(),
          minShares,
        )
      })

      if (txs.length > 1) {
        return await createBatch(txs, {}, transactionOptions)
      } else {
        return await createTransaction({ tx: txs[0] }, transactionOptions)
      }
    } else {
      if (!values) return null

      const tOptions = {
        amount: values.tokensToGetShifted,
        symbol: meta.symbol,
        withLrna: values.lrnaToGetShifted.isGreaterThan(0)
          ? t("liquidity.remove.modal.toast.withLrna", {
              lrna: values.lrnaToGetShifted,
            })
          : "",
      }

      const toast = TOAST_MESSAGES.reduce((memo, type) => {
        const msType = type === "onError" ? "onLoading" : type
        memo[type] = (
          <Trans
            t={t}
            i18nKey={`liquidity.remove.modal.toast.${msType}`}
            tOptions={tOptions}
          >
            <span />
            <span className="highlight" />
          </Trans>
        )
        return memo
      }, {} as ToastMessage)

      return await createTransaction(
        {
          tx: api.tx.omnipool.removeLiquidityWithLimit(
            position.id,
            removeShares.toFixed(0),
            getMinSharesToGet(values.tokensToGet),
          ),
        },
        {
          toast,
          onBack: () => null,
          onClose,
          onSuccess,
          onSubmitted: () => onSubmit(values.tokensToGet.toString()),
          onError,
        },
      )
    }
  })

  const isFeeExceeded = values?.withdrawalFee?.gte(1)

  return {
    values,
    totalValue,
    removeValue,
    remainingValue,
    isFeeExceeded,
    meta,
    mutation,
  }
}
