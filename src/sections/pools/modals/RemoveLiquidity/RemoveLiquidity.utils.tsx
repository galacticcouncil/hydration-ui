import { useTokenBalance } from "api/balances"
import { useOraclePrice } from "api/farms"
import { useOmnipoolAsset } from "api/omnipool"
import { useSpotPrice } from "api/spotPrice"
import { useRpcProvider } from "providers/rpcProvider"
import { useCallback, useMemo } from "react"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { BN_0 } from "utils/constants"
import BN from "bignumber.js"
import {
  calculate_lrna_spot_price,
  calculate_withdrawal_fee,
} from "@galacticcouncil/math-omnipool"
import { scaleHuman } from "utils/balance"
import { useMinWithdrawalFee } from "api/consts"
import { useMutation } from "@tanstack/react-query"
import { ToastMessage, useStore } from "state/store"
import { TOAST_MESSAGES } from "state/toasts"
import { Trans, useTranslation } from "react-i18next"
import { useLiquidityPositionData } from "utils/omnipool"

export type RemoveLiquidityProps = {
  onClose: () => void
  position: HydraPositionsTableData | HydraPositionsTableData[]
  onSuccess: () => void
  onSubmitted?: (tokensToGet: string) => void
}

const defaultValues = {
  tokensToGet: BN_0,
  lrnaToGet: BN_0,
  lrnaPayWith: BN_0,
  tokensPayWith: BN_0,
  withdrawalFee: BN_0,
  minWithdrawalFee: BN_0,
}

export const useRemoveLiquidity = (
  position: HydraPositionsTableData | HydraPositionsTableData[],
  percentage: number,
  onClose: () => void,
  onSuccess: () => void,
  onSubmit: (value: string) => void,
) => {
  const { createTransaction } = useStore()
  const { assets, api } = useRpcProvider()
  const { t } = useTranslation()
  const isPositionMultiple = Array.isArray(position)

  const { assetId } = isPositionMultiple ? position[0] : position

  const meta = assets.getAsset(assetId)
  const hubMeta = assets.hub

  const spotPrice = useSpotPrice(hubMeta.id, assetId)
  const oracle = useOraclePrice(assetId, hubMeta.id)
  const minlFeeQuery = useMinWithdrawalFee()
  const { getData } = useLiquidityPositionData([assetId])
  const omnipoolAsset = useOmnipoolAsset(assetId)
  const omnipoolBalance = useTokenBalance(assetId, OMNIPOOL_ACCOUNT_ADDRESS)

  const { removeShares, totalShares } = useMemo(() => {
    if (isPositionMultiple) {
      const totalShares = position.reduce(
        (acc, pos) => acc.plus(pos.shares),
        BN_0,
      )
      return { removeShares: totalShares, totalShares }
    }

    const totalShares = position.shares
    return {
      totalShares,
      removeShares: totalShares.div(100).times(percentage),
    }
  }, [isPositionMultiple, position, percentage])

  const calculateLiquidityValues = useCallback(
    (position: HydraPositionsTableData, removeSharesValue: BN) => {
      if (
        omnipoolBalance.data &&
        omnipoolAsset?.data &&
        spotPrice.data &&
        oracle.data &&
        minlFeeQuery.data
      ) {
        const oraclePrice = oracle.data.oraclePrice ?? BN_0
        const minWithdrawalFee = minlFeeQuery.data

        const lrnaSpotPrice = calculate_lrna_spot_price(
          omnipoolBalance.data.balance.toString(),
          omnipoolAsset.data.hubReserve.toString(),
        )

        const withdrawalFee = calculate_withdrawal_fee(
          lrnaSpotPrice,
          oraclePrice.toString(),
          minWithdrawalFee.toString(),
        )

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
          lrnaToGet: valueWithFee.lrna,
          lrnaPayWith: valueWithoutFee.lrna.minus(valueWithFee.lrna),
          tokensPayWith: valueWithoutFee.value.minus(valueWithFee.value),
          withdrawalFee: scaleHuman(withdrawalFee, "q").multipliedBy(100),
          minWithdrawalFee,
        }
      }
    },
    [
      getData,
      minlFeeQuery.data,
      omnipoolAsset.data,
      omnipoolBalance.data,
      oracle.data,
      spotPrice.data,
    ],
  )

  const values = useMemo(() => {
    if (isPositionMultiple) {
      return position.reduce((acc, pos) => {
        const values = calculateLiquidityValues(pos, pos.shares)

        if (values) {
          return {
            tokensToGet: acc.tokensToGet.plus(values.tokensToGet),
            lrnaToGet: acc.lrnaToGet.plus(values.lrnaToGet),
            lrnaPayWith: acc.lrnaPayWith.plus(values.lrnaPayWith),
            tokensPayWith: acc.tokensPayWith.plus(values.tokensPayWith),
            withdrawalFee: values.withdrawalFee,
            minWithdrawalFee: values.minWithdrawalFee,
          }
        }

        return acc
      }, defaultValues)
    }
    console.log(
      calculateLiquidityValues(position, removeShares)?.tokensToGet.toString(),
    )
    return calculateLiquidityValues(position, removeShares)
  }, [calculateLiquidityValues, isPositionMultiple, position, removeShares])

  const mutation = useMutation(async () => {
    if (isPositionMultiple) {
      const toast = TOAST_MESSAGES.reduce((memo, type) => {
        const msType = type === "onError" ? "onLoading" : type
        memo[type] = (
          <Trans t={t} i18nKey={`liquidity.remove.modal.all.toast.${msType}`}>
            <span />
          </Trans>
        )
        return memo
      }, {} as ToastMessage)

      const transactioOptions = {
        toast,
        onBack: () => null,
        onClose,
        onSuccess,
      }

      const txs = position.map((position) =>
        api.tx.omnipool.removeLiquidity(
          position.id,
          position.shares.toFixed(0),
        ),
      )

      if (txs.length > 1) {
        return await createTransaction(
          { tx: api.tx.utility.batch(txs) },
          transactioOptions,
        )
      } else {
        return await createTransaction({ tx: txs[0] }, transactioOptions)
      }
    } else {
      if (!values) return null

      const tOptions = {
        amount: values.tokensToGet,
        fixedPointScale: meta.decimals,
        symbol: meta.symbol,
        withLrna: values.lrnaToGet.isGreaterThan(0)
          ? t("liquidity.remove.modal.toast.withLrna", {
              lrna: values.lrnaToGet,
              fixedPointScale: hubMeta.decimals,
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
          tx: api.tx.omnipool.removeLiquidity(
            position.id,
            removeShares.toFixed(0),
          ),
        },
        {
          toast,
          onBack: () => null,
          onClose,
          onSuccess,
          onSubmitted: () => onSubmit(values.tokensToGet.toString()),
        },
      )
    }
  })

  const isFeeExceeded = values?.withdrawalFee?.gte(1)

  return { values, removeShares, totalShares, isFeeExceeded, meta, mutation }
}
