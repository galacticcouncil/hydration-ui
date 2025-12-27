import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { prop } from "remeda"
import { useShallow } from "zustand/shallow"

import { XykDeposit, xykMiningPositionsKey } from "@/api/account"
import { useIsolatedPoolFarms } from "@/api/farms"
import { useShareTokenPrices } from "@/api/spotPrice"
import { useXYKPoolWithLiquidity, XYKPoolWithLiquidity } from "@/api/xyk"
import {
  convertXYKSharesToValues,
  useLiquidityMinLimit,
} from "@/modules/liquidity/Liquidity.utils"
import { TShareToken, useAssets } from "@/providers/assetsProvider"
import { Papi, useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances, useAccountData } from "@/states/account"
import { TransactionToasts, useTransactionsStore } from "@/states/transactions"
import { scale, scaleHuman, toDecimal } from "@/utils/formatting"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

import { useRemoveLiquidityForm } from "./RemoveLiquidity.utils"

export type TRemoveXykPositionsProps = {
  shareTokenMeta: TShareToken
  pool: XYKPoolWithLiquidity
}

const useSubmitToasts = () => {
  const { t } = useTranslation("liquidity")

  return (value: string, symbol: string): TransactionToasts => {
    return {
      submitted: t("liquidity.remove.modal.xyk.toast.submitted", {
        value,
        symbol,
      }),
      success: t("liquidity.remove.modal.xyk.toast.success", {
        value,
        symbol,
      }),
    }
  }
}

export const useRemoveSelectableXYKPositions = ({
  poolId,
}: {
  poolId: string
}) => {
  const { getShareTokenByAddress } = useAssets()
  const [selectedPositionIds, setSelectedPositionIds] = useState<Set<string>>(
    new Set(),
  )
  const positions = useAccountData(useShallow(prop("xykMining")))
  const { data: shareTokenPrices } = useShareTokenPrices([poolId])
  const { data: pool } = useXYKPoolWithLiquidity(poolId)
  const { data: farms } = useIsolatedPoolFarms(poolId)

  const price = shareTokenPrices.get(poolId)
  const meta = getShareTokenByAddress(poolId)
  if (!pool || !price || !meta) return undefined

  const positionsData = positions.map((position) => {
    const isSelected = selectedPositionIds.has(position.id)
    const sharesShifted = scaleHuman(position.shares, meta.decimals)
    const sharesDisplay = Big(sharesShifted).times(price).toString()

    return {
      ...position,
      sharesShifted,
      sharesDisplay,
      isSelected,
    }
  })

  const selectedPositions = positionsData.filter((pos) => pos.isSelected)

  const removableValue = selectedPositions.reduce(
    (acc, pos) => ({
      value: acc.value.plus(pos.sharesShifted),
      displayValue: acc.displayValue.plus(pos.sharesDisplay),
    }),
    {
      value: Big(0),
      displayValue: Big(0),
    },
  )

  return {
    removableValues: [
      {
        asset: meta,
        value: removableValue.value.toString(),
        displayValue: removableValue.displayValue.toString(),
      },
    ],
    meta,
    positions: positionsData,
    activeFarms: farms,
    setSelectedPositionIds,
    selectedPositionIds,
    selectedPositions,
    tokens: pool.tokens,
    address: poolId,
    pool,
  }
}

export const useRemoveMultipleXYKPositions = ({
  positions,
  pool,
  onSubmitted,
  shareTokenMeta,
}: TRemoveXykPositionsProps & {
  positions: XykDeposit[]
  shareTokenMeta: TShareToken
  onSubmitted: () => void
}) => {
  const { papi } = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const createTransaction = useTransactionsStore(prop("createTransaction"))
  const submitToasts = useSubmitToasts()
  const getLiquidityMinLimit = useLiquidityMinLimit()
  const { account } = useAccount()

  const { tokens, totalLiquidity } = pool
  const removeSharesAmount = positions
    .reduce((acc, pos) => acc.plus(pos.shares.toString()), Big(0))
    .toString()

  const form = useRemoveLiquidityForm({
    asset: shareTokenMeta,
    initialAmount: removeSharesAmount,
  })

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const [assetA, assetB] = tokens

      if (!assetA || !assetB) throw new Error("Pool not found")

      const { liquidityTxs, exitingFarmsTxs } = positions.reduce<{
        liquidityTxs: ReturnType<
          Papi["tx"]["XYK"]["remove_liquidity_with_limits"]
        >[]
        exitingFarmsTxs: ReturnType<
          Papi["tx"]["XYKLiquidityMining"]["withdraw_shares"]
        >[]
      }>(
        (acc, position) => {
          const [minAssetA, minAssetB] = convertXYKSharesToValues(
            pool,
            position.shares,
            getLiquidityMinLimit,
          )

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
            papi.tx.XYK.remove_liquidity_with_limits({
              asset_a: Number(assetA.id),
              asset_b: Number(assetB.id),
              share_amount: BigInt(position.shares.toString()),
              min_amount_a: BigInt(minAssetA.value),
              min_amount_b: BigInt(minAssetB.value),
            }),
          )

          return acc
        },
        { liquidityTxs: [], exitingFarmsTxs: [] },
      )

      const toasts = submitToasts(
        toDecimal(removeSharesAmount, shareTokenMeta.decimals),
        shareTokenMeta.symbol,
      )

      await createTransaction(
        {
          tx: papi.tx.Utility.batch_all({
            calls: [...exitingFarmsTxs, ...liquidityTxs].map(
              (t) => t.decodedCall,
            ),
          }),
          toasts,
          invalidateQueries: [xykMiningPositionsKey(account?.address ?? "")],
        },
        { onSubmitted },
      )
    },
  })

  const receiveAssets = tokens.map((token) => {
    const tokenTotalBalance = token.balance

    const value = Big(tokenTotalBalance.toString())
      .times(removeSharesAmount)
      .div(totalLiquidity.toString())
      .toString()

    const asset = getAssetWithFallback(token.id)

    return {
      asset,
      value,
    }
  })

  return {
    form,
    mutation,
    meta: shareTokenMeta,
    isIsolatedPool: true,
    receiveAssets,
    totalPositionShifted: scaleHuman(
      removeSharesAmount,
      shareTokenMeta.decimals,
    ),
    deposits: positions,
  }
}

export const useRemoveSingleXYKPosition = ({
  position,
  pool,
  shareTokenMeta,
  onSubmitted,
}: TRemoveXykPositionsProps & {
  position: XykDeposit
  shareTokenMeta: TShareToken
  onSubmitted: () => void
}) => {
  const submitToasts = useSubmitToasts()
  const { account } = useAccount()
  const { papi } = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const createTransaction = useTransactionsStore(prop("createTransaction"))
  const getLiquidityMinLimit = useLiquidityMinLimit()

  const { tokens, totalLiquidity } = pool

  const balance = position.shares.toString()
  const balanceShifted = scaleHuman(balance, shareTokenMeta.decimals)

  const form = useRemoveLiquidityForm({
    asset: shareTokenMeta,
    initialAmount: balanceShifted,
  })

  const removeSharesAmount = balance

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const [assetA, assetB] = tokens

      if (!assetA || !assetB) throw new Error("Pool not found")

      const toasts = submitToasts(
        toDecimal(balanceShifted, shareTokenMeta.decimals),
        shareTokenMeta.symbol,
      )

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

      const [minAssetA, minAssetB] = convertXYKSharesToValues(
        pool,
        position.shares,
        getLiquidityMinLimit,
      )

      const removeLiquidityTx = papi.tx.XYK.remove_liquidity_with_limits({
        asset_a: Number(assetA.id),
        asset_b: Number(assetB.id),
        share_amount: BigInt(position.shares.toString()),
        min_amount_a: BigInt(minAssetA.value),
        min_amount_b: BigInt(minAssetB.value),
      })

      await createTransaction(
        {
          tx: papi.tx.Utility.batch_all({
            calls: [...exitFarmsTxs, removeLiquidityTx].map(
              (t) => t.decodedCall,
            ),
          }),
          toasts,
          invalidateQueries: [xykMiningPositionsKey(account?.address ?? "")],
        },
        { onSubmitted },
      )
    },
  })

  const receiveAssets = tokens.map((token) => {
    const tokenTotalBalance = token.balance

    const value = Big(tokenTotalBalance.toString())
      .times(removeSharesAmount)
      .div(totalLiquidity.toString())
      .toString()

    const asset = getAssetWithFallback(token.id)

    return {
      asset,
      value,
    }
  })

  return {
    receiveAssets,
    totalPositionShifted: balanceShifted,
    mutation,
    form,
    meta: shareTokenMeta,
    isIsolatedPool: true,
    deposits: [position],
  }
}

export const useRemoveXYKShares = ({
  pool,
  shareTokenId,
  shareTokenMeta,
  onSubmitted,
}: TRemoveXykPositionsProps & {
  shareTokenId: string
  shareTokenMeta: TShareToken
  onSubmitted: () => void
}) => {
  const submitToasts = useSubmitToasts()
  const { papi } = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const createTransaction = useTransactionsStore(prop("createTransaction"))
  const { getTransferableBalance } = useAccountBalances()
  const getLiquidityMinLimit = useLiquidityMinLimit()

  const balance = getTransferableBalance(shareTokenId).toString()
  const balanceShifted = scaleHuman(balance, shareTokenMeta.decimals)

  const { tokens, totalLiquidity } = pool

  const form = useRemoveLiquidityForm({
    asset: shareTokenMeta,
    initialAmount: balanceShifted,
    rule: required
      .pipe(positive)
      .check(validateFieldMaxBalance(balanceShifted)),
  })

  const removeSharesAmount = scale(
    form.watch("amount") || "0",
    shareTokenMeta.decimals,
  )

  const receiveAssets = tokens.map((token) => {
    const tokenTotalBalance = token.balance

    const value = Big(tokenTotalBalance.toString())
      .times(removeSharesAmount)
      .div(totalLiquidity.toString())
      .toString()

    const asset = getAssetWithFallback(token.id)

    return {
      asset,
      value,
    }
  })

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const [assetA, assetB] = receiveAssets

      if (!assetA || !assetB) throw new Error("Pool not found")

      const toasts = submitToasts(
        toDecimal(removeSharesAmount, shareTokenMeta.decimals),
        shareTokenMeta.symbol,
      )

      const minAssetA = getLiquidityMinLimit(assetA.value)
      const minAssetB = getLiquidityMinLimit(assetB.value)

      const tx = papi.tx.XYK.remove_liquidity_with_limits({
        asset_a: Number(assetA.asset.id),
        asset_b: Number(assetB.asset.id),
        share_amount: BigInt(Big(removeSharesAmount).toFixed(0)),
        min_amount_a: BigInt(minAssetA),
        min_amount_b: BigInt(minAssetB),
      })

      await createTransaction(
        {
          tx,
          toasts,
        },
        { onSubmitted },
      )
    },
  })

  return {
    form,
    mutation,
    meta: shareTokenMeta,
    isIsolatedPool: true,
    receiveAssets,
    totalPositionShifted: balanceShifted,
    editable: true,
  }
}
