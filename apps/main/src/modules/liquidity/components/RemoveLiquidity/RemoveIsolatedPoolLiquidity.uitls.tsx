import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { prop } from "remeda"

import { XykDeposit } from "@/api/account"
import { PoolToken } from "@/api/pools"
import { useXYKPoolsLiquidity } from "@/api/xyk"
import { useAssets } from "@/providers/assetsProvider"
import { Papi, useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useXYKPool } from "@/states/liquidity"
import { TransactionToasts, useTransactionsStore } from "@/states/transactions"
import { scale, scaleHuman } from "@/utils/formatting"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

import { useRemoveLiquidityForm } from "./RemoveLiquidity.utils"

export type TRemoveXykPositionsProps = {
  poolTokens: PoolToken[]
  address: string
}

const useSubmitToasts = () => {
  const { t } = useTranslation("liquidity")

  return (value: string): TransactionToasts => {
    return {
      submitted: t("liquidity.remove.modal.xyk.toast.submitted", {
        value,
      }),
      success: t("liquidity.remove.modal.xyk.toast.success", {
        value,
      }),
    }
  }
}

export const useRemoveSelectableXYKPositions = ({
  poolId,
}: {
  poolId: string
}) => {
  const [selectedPositionIds, setSelectedPositionIds] = useState<Set<string>>(
    new Set(),
  )

  const { data: xykData } = useXYKPool(poolId)
  const { data: liquidity } = useXYKPoolsLiquidity(poolId)

  if (!xykData) return undefined

  const { meta, tvlDisplay, positions, farms, tokens } = xykData

  const price = Big(tvlDisplay)
    .div(liquidity ? scaleHuman(liquidity, meta.decimals) : 1)
    .toString()

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
    tokens,
    address: poolId,
  }
}

export const useRemoveMultipleXYKPositions = ({
  positions,
  poolTokens,
  address,
}: TRemoveXykPositionsProps & {
  positions: XykDeposit[]
}) => {
  const { papi } = useRpcProvider()
  const { getAssetWithFallback, getMetaFromXYKPoolTokens } = useAssets()
  const createTransaction = useTransactionsStore(prop("createTransaction"))
  const submitToasts = useSubmitToasts()

  const meta = getMetaFromXYKPoolTokens(address, poolTokens)

  const { data: liquidity } = useXYKPoolsLiquidity(address)

  const removeSharesAmount = positions
    .reduce((acc, pos) => acc.plus(pos.shares.toString()), Big(0))
    .toString()

  const form = useRemoveLiquidityForm({
    asset: meta ?? undefined,
    initialAmount: removeSharesAmount,
  })

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const [assetA, assetB] = poolTokens

      if (!assetA || !assetB) throw new Error("Pool not found")

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

      const toasts = submitToasts(removeSharesAmount)

      await createTransaction({
        tx: papi.tx.Utility.batch_all({
          calls: [...exitingFarmsTxs, ...liquidityTxs].map(
            (t) => t.decodedCall,
          ),
        }),
        toasts,
      })
    },
  })

  if (!liquidity || !meta) return undefined

  const receiveAssets = poolTokens.map((token) => {
    const tokenTotalBalance = token.balance

    const value = Big(tokenTotalBalance.toString())
      .times(removeSharesAmount)
      .div(liquidity.toString())
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
    meta,
    isIsolatedPool: true,
    receiveAssets,
    totalPositionShifted: scaleHuman(removeSharesAmount, meta.decimals),
    deposits: positions,
  }
}

export const useRemoveSingleXYKPosition = ({
  address,
  position,
  poolTokens,
}: TRemoveXykPositionsProps & {
  position: XykDeposit
}) => {
  const submitToasts = useSubmitToasts()

  const { papi } = useRpcProvider()
  const { getAssetWithFallback, getMetaFromXYKPoolTokens } = useAssets()
  const createTransaction = useTransactionsStore(prop("createTransaction"))

  const meta = getMetaFromXYKPoolTokens(address, poolTokens)

  const { data: liquidity } = useXYKPoolsLiquidity(address)

  const balance = position.shares.toString()
  const balanceShifted = scaleHuman(balance, meta?.decimals ?? 0)

  const form = useRemoveLiquidityForm({
    asset: meta ?? undefined,
    initialAmount: balanceShifted,
  })

  const removeSharesAmount = balance

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const [assetA, assetB] = poolTokens ?? []

      if (!assetA || !assetB) throw new Error("Pool not found")

      const toasts = submitToasts(removeSharesAmount)

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

      await createTransaction({
        tx: papi.tx.Utility.batch_all({
          calls: [...exitFarmsTxs, removeLiquidityTx].map((t) => t.decodedCall),
        }),
        toasts,
      })
    },
  })

  if (!liquidity || !meta) return undefined

  const receiveAssets = poolTokens.map((token) => {
    const tokenTotalBalance = token.balance

    const value = Big(tokenTotalBalance.toString())
      .times(removeSharesAmount)
      .div(liquidity.toString())
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
    meta,
    isIsolatedPool: true,
    deposits: [position],
  }
}

export const useRemoveXYKShares = ({
  address,
  poolTokens,
  shareTokenId,
}: TRemoveXykPositionsProps & {
  shareTokenId: string
}) => {
  const submitToasts = useSubmitToasts()
  const { papi } = useRpcProvider()
  const { getAssetWithFallback, getMetaFromXYKPoolTokens } = useAssets()
  const createTransaction = useTransactionsStore(prop("createTransaction"))
  const { getTransferableBalance } = useAccountBalances()

  const meta = getMetaFromXYKPoolTokens(address, poolTokens)

  const balance = getTransferableBalance(shareTokenId).toString()

  const balanceShifted = scaleHuman(balance, meta?.decimals ?? 0)

  const { data: liquidity } = useXYKPoolsLiquidity(address)

  const form = useRemoveLiquidityForm({
    asset: meta ?? undefined,
    initialAmount: balanceShifted,
    rule: required
      .pipe(positive)
      .check(validateFieldMaxBalance(balanceShifted)),
  })

  const removeSharesAmount = scale(
    form.watch("amount") || "0",
    meta?.decimals ?? 0,
  )

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const [assetA, assetB] = poolTokens ?? []

      if (!assetA || !assetB) throw new Error("Pool not found")

      const toasts = submitToasts(removeSharesAmount)

      const tx = papi.tx.XYK.remove_liquidity({
        asset_a: Number(assetA.id),
        asset_b: Number(assetB.id),
        share_amount: BigInt(Big(removeSharesAmount).toFixed(0)),
      })

      await createTransaction({
        tx,
        toasts,
      })
    },
  })

  if (!liquidity || !meta) return undefined

  const receiveAssets = poolTokens.map((token) => {
    const tokenTotalBalance = token.balance

    const value = Big(tokenTotalBalance.toString())
      .times(removeSharesAmount)
      .div(liquidity.toString())
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
    meta,
    isIsolatedPool: true,
    receiveAssets,
    totalPositionShifted: balanceShifted,
    editable: true,
  }
}
