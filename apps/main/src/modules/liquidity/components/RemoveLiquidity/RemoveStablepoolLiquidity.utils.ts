import { calculate_liquidity_out_one_asset } from "@galacticcouncil/math-stableswap"
import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useEffect, useMemo } from "react"
import { useForm, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { isNonNullish, prop } from "remeda"
import * as z from "zod/v4"

import {
  OmnipoolDepositFull,
  omnipoolMiningPositionsKey,
  omnipoolPositionsKey,
} from "@/api/account"
import { TAssetData, TStableswap } from "@/api/assets"
import { TSelectedAsset } from "@/components/AssetSelect/AssetSelect"
import { TAssetWithBalance } from "@/components/AssetSelectModal/AssetSelectModal.utils"
import { TReceiveAsset } from "@/modules/liquidity/components/RemoveLiquidity/ReceiveAssets"
import { TRemoveLiquidityFormValues } from "@/modules/liquidity/components/RemoveLiquidity/RemoveLiquidity.utils"
import {
  getOmnipoolLiquidityOutTotal,
  useRemoveOmnipoolLiquidityOut,
} from "@/modules/liquidity/components/RemoveLiquidity/RemoveOmnipoolLiquidity.utils"
import {
  RemoveStablepoolPositionsProps,
  RemoveStablepoolSharesProps,
} from "@/modules/liquidity/components/RemoveLiquidity/RemoveStablepoolLiquidity"
import {
  calculatePoolFee,
  TStablepoolDetails,
} from "@/modules/liquidity/Liquidity.utils"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { useAssets } from "@/providers/assetsProvider"
import { Papi, useRpcProvider } from "@/providers/rpcProvider"
import { isOmnipoolDepositPosition, useAccountBalances } from "@/states/account"
import { AccountOmnipoolPosition } from "@/states/account"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scale, scaleHuman, toBig, toBigInt } from "@/utils/formatting"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

export type TRemoveStablepoolLiquidityFormValues =
  TRemoveLiquidityFormValues & {
    split: boolean
    receiveAsset: TAssetData
    receiveAmount: string
    option: "omnipool" | "stablepool"
  }

export type TRemoveStablepoolLiquidityProps =
  | ReturnType<typeof useRemoveOmnipoolLiquidity>
  | ReturnType<typeof useRemoveStableswapSharesLiquidity>

export const useRemoveStablepoolLiquidity = ({
  poolDetails,
  initialReceiveAsset,
  positions,
}: {
  poolDetails: TStablepoolDetails
  initialReceiveAsset: TAssetWithBalance
  positions: AccountOmnipoolPosition[]
}) => {
  const poolId = poolDetails.pool.id.toString()

  const { getAssetWithFallback, hub } = useAssets()
  const meta = getAssetWithFallback(poolId)

  const calculateLiquidityValues = useRemoveOmnipoolLiquidityOut(poolId)
  const omnipoolPositionsOutValues = positions
    .map((position) => {
      const valuesOut = calculateLiquidityValues(
        position,
        position.shares.toString(),
      )
      if (!valuesOut) return undefined

      return {
        position,
        valuesOut,
      }
    })
    .filter(isNonNullish)

  let totalPositionShares = Big(0)
  let totalPositionShifted = Big(0)
  const deposits: OmnipoolDepositFull[] = []

  for (const position of positions) {
    totalPositionShares = totalPositionShares.plus(position.shares.toString())
    totalPositionShifted = totalPositionShifted.plus(
      position.data.currentValueHuman,
    )

    if (isOmnipoolDepositPosition(position)) {
      deposits.push(position)
    }
  }

  const balance = totalPositionShifted.toString()

  const form = useRemoveStablepoolLiquidityForm({
    receiveAsset: initialReceiveAsset,
    balance,
    asset: meta,
    initialAmount: balance,
  })

  const { watch, setValue } = form

  const [option, split] = watch(["option", "split"])
  const isFullRemove = option === "stablepool"

  const omnipoolPositionsOutTotal = getOmnipoolLiquidityOutTotal(
    omnipoolPositionsOutValues,
  )
  const { tokensPayWith, hubPayWith } = omnipoolPositionsOutTotal

  const fee = omnipoolPositionsOutTotal.withdrawalFee
  const feesBreakdown = [
    { symbol: meta.symbol, value: tokensPayWith, id: meta.id },
  ]

  if (Big(hubPayWith).gt(0)) {
    feesBreakdown.push({
      symbol: hub.symbol,
      value: hubPayWith,
      id: hub.id,
    })
  }

  useEffect(() => {
    if (!isFullRemove && !split) {
      setValue("split", true)
    }
  }, [isFullRemove, setValue, split])

  return {
    form,
    isFullRemove,
    omnipoolPositionsOutValues,
    balance,
    fee,
    feesBreakdown,
    omnipoolPositionsOutTotal,
    deposits,
  }
}

export const useRemoveOmnipoolLiquidity = (
  props: RemoveStablepoolPositionsProps,
) => {
  const { hub, getAssetWithFallback } = useAssets()
  const { watch } = useFormContext<TRemoveStablepoolLiquidityFormValues>()
  const [poolMeta] = watch(["asset"])
  const { papi } = useRpcProvider()
  const createBatch = useCreateBatchTx()
  const { t } = useTranslation("liquidity")
  const { account } = useAccount()

  const { omnipoolPositionsOutValues, onSubmitted, omnipoolPositionsOutTotal } =
    props
  const { hubToGet, minTokensToGet } = omnipoolPositionsOutTotal

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const liquidityTxs: ReturnType<
        Papi["tx"]["Omnipool"]["remove_liquidity_with_limit"]
      >[] = []
      const exitingFarmsTxs: ReturnType<
        Papi["tx"]["OmnipoolLiquidityMining"]["withdraw_shares"]
      >[] = []

      for (const {
        position,
        valuesOut: { minTokensToGet },
      } of omnipoolPositionsOutValues) {
        if (isOmnipoolDepositPosition(position)) {
          position.yield_farm_entries.forEach((entry) => {
            const tx = papi.tx.OmnipoolLiquidityMining.withdraw_shares({
              deposit_id: BigInt(position.miningId),
              yield_farm_id: entry.yield_farm_id,
            })

            exitingFarmsTxs.push(tx)
          })
        }

        liquidityTxs.push(
          papi.tx.Omnipool.remove_liquidity_with_limit({
            amount: position.shares,
            position_id: BigInt(position.positionId),
            min_limit: BigInt(Big(minTokensToGet).toFixed(0)),
          }),
        )
      }

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

  const onSubmit = () => {
    mutation.mutate()
  }

  const receiveAssets: TReceiveAsset[] = [
    {
      asset: getAssetWithFallback(poolMeta.id),
      value: minTokensToGet,
    },
  ]

  if (Big(hubToGet).gt(0)) {
    receiveAssets.push({
      asset: hub,
      value: hubToGet,
    })
  }

  const editable =
    omnipoolPositionsOutValues.length < 2 &&
    !omnipoolPositionsOutValues.some(({ position }) =>
      isOmnipoolDepositPosition(position),
    )

  return {
    ...props,
    onSubmit,
    isFullRemove: false,
    receiveAssets,
    editable,
    isRemoveShares: false,
  }
}

export const useRemoveStablepoolOmnipoolLiquidity = (
  props: RemoveStablepoolPositionsProps,
) => {
  const { t } = useTranslation("liquidity")
  const { hub } = useAssets()
  const { papi } = useRpcProvider()
  const createBatch = useCreateBatchTx()
  const {
    liquidity: { slippage },
  } = useTradeSettings()
  const { account } = useAccount()
  const { watch, setValue, getValues } =
    useFormContext<TRemoveStablepoolLiquidityFormValues>()
  const [poolMeta, receiveAsset, split] = watch([
    "asset",
    "receiveAsset",
    "split",
  ])

  const {
    stablepoolData: { pool, reserves },
    omnipoolPositionsOutTotal,
    omnipoolPositionsOutValues,
  } = props
  const { tokensToGet, minTokensToGetShifted, hubToGet } =
    omnipoolPositionsOutTotal
  const stablepoolFee = calculatePoolFee(pool.fee) ?? "0"
  const totalIssuance = pool.totalIssuance.toString()
  const amplification = pool.amplification.toString()
  const stablepoolSharesToGet = tokensToGet

  const minOneAssetToReceive = useMemo(() => {
    if (!stablepoolFee) return undefined

    const maxValue = calculate_liquidity_out_one_asset(
      JSON.stringify(
        reserves.map((reserve) => ({
          amount: reserve.amount,
          decimals: reserve.meta.decimals,
          asset_id: reserve.asset_id,
        })),
      ),
      stablepoolSharesToGet,
      Number(receiveAsset.id),
      amplification,
      totalIssuance,
      scaleHuman(stablepoolFee, 2),
      JSON.stringify(pool.pegs),
    )

    const value = Big(maxValue)
      .minus(Big(slippage).times(maxValue).div(100))
      .toFixed(0)

    return value
  }, [
    stablepoolFee,
    amplification,
    pool.pegs,
    receiveAsset.id,
    stablepoolSharesToGet,
    reserves,
    slippage,
    totalIssuance,
  ])

  const minReservesToReceive = useMemo(() => {
    return reserves.map((reserve) => {
      const maxValue = Big(stablepoolSharesToGet)
        .div(totalIssuance)
        .times(reserve.amount)
        .toFixed(0)

      const value = Big(maxValue)
        .minus(Big(slippage).times(maxValue).div(100))
        .toFixed(0)

      return { value, asset: reserve.meta }
    })
  }, [totalIssuance, stablepoolSharesToGet, reserves, slippage])

  useEffect(() => {
    if (!split && minOneAssetToReceive) {
      const receiveAmount = toBig(minOneAssetToReceive, receiveAsset.decimals)
      setValue("receiveAmount", receiveAmount.toFixed(0))
    }
  }, [setValue, split, minOneAssetToReceive, receiveAsset.decimals, slippage])

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const txs = omnipoolPositionsOutValues.map(({ position, valuesOut }) =>
        papi.tx.OmnipoolLiquidityMining.remove_liquidity_stableswap_omnipool_and_exit_farms(
          {
            position_id: BigInt(position.positionId),
            deposit_id: isOmnipoolDepositPosition(position)
              ? BigInt(position.miningId)
              : undefined,
            omnipool_min_limit: BigInt(
              Big(valuesOut.minTokensToGet).toFixed(0),
            ),
            stableswap_min_amounts_out: split
              ? minReservesToReceive.map((asset) => ({
                  amount: BigInt(asset.value),
                  asset_id: Number(asset.asset.id),
                }))
              : [
                  {
                    amount: toBigInt(
                      getValues("receiveAmount"),
                      receiveAsset.decimals,
                    ),
                    asset_id: Number(receiveAsset.id),
                  },
                ],
          },
        ),
      )

      const hubValue =
        hubToGet !== "0"
          ? t("liquidity.remove.modal.toast.hub", {
              value: scaleHuman(hubToGet, hub.decimals),
            })
          : undefined

      const tOptions = {
        value: minTokensToGetShifted,
        symbol: poolMeta.symbol,
        hub: hubValue,
      }

      const toasts = {
        submitted: t("liquidity.remove.modal.toast.submitted", tOptions),
        success: t("liquidity.remove.modal.toast.success", tOptions),
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
      })
    },
  })

  const onSubmit = () => {
    mutation.mutate()
  }

  const receiveAssets: TReceiveAsset[] = split ? [...minReservesToReceive] : []

  if (Big(hubToGet).gt(0)) {
    receiveAssets.push({
      asset: hub,
      value: hubToGet,
    })
  }

  const fee = Big(props.fee)
    .plus(!split ? stablepoolFee : 0)
    .toString()

  const feesBreakdown = split
    ? [...props.feesBreakdown]
    : props.feesBreakdown.map((fee) => {
        if (fee.id === hub.id) {
          return fee
        }

        return {
          ...fee,
          value: Big(fee.value).times(Big(stablepoolFee).plus(1)).toString(),
        }
      })

  return {
    ...props,
    onSubmit,
    fee,
    feesBreakdown,
    editable: false,
    isFullRemove: true,
    receiveAssets,
    isRemoveShares: false,
  }
}

export const useRemoveStableswapSharesLiquidity = (
  props: RemoveStablepoolSharesProps,
) => {
  const { t } = useTranslation("liquidity")
  const { getAssetWithFallback } = useAssets()
  const { papi } = useRpcProvider()
  const createTransaction = useTransactionsStore(prop("createTransaction"))
  const {
    liquidity: { slippage },
  } = useTradeSettings()

  const { stablepoolData, initialReceiveAsset, onSubmitted } = props
  const { pool, reserves } = stablepoolData
  const { getTransferableBalance } = useAccountBalances()
  const meta = getAssetWithFallback(pool.id) as TStableswap
  const fee = calculatePoolFee(pool.fee)

  const balanceShifted = scaleHuman(
    getTransferableBalance(pool.id.toString()).toString(),
    meta.decimals,
  )

  const form = useRemoveStablepoolLiquidityForm({
    receiveAsset: initialReceiveAsset,
    balance: balanceShifted,
    asset: { ...meta, iconId: meta.underlyingAssetId },
  })

  const [removeAmountShifted = "0", receiveAsset, split] = form.watch([
    "amount",
    "receiveAsset",
    "split",
  ])
  const removeAmount = Big(scale(removeAmountShifted, meta.decimals)).toFixed(0)
  const totalIssuance = pool.totalIssuance.toString()

  const receiveAssets = useMemo(() => {
    return reserves.map((reserve) => {
      const maxValue = Big(removeAmount)
        .div(totalIssuance)
        .times(reserve.amount)
        .toFixed(0)

      const value = Big(maxValue)
        .minus(Big(slippage).times(maxValue).div(100))
        .toFixed(0)

      return { value, asset: reserve.meta }
    })
  }, [totalIssuance, removeAmount, reserves, slippage])

  const liquidityOutOneAsset = useMemo(() => {
    if (!fee) return undefined

    const maxValue = calculate_liquidity_out_one_asset(
      JSON.stringify(
        reserves.map((reserve) => ({
          amount: reserve.amount,
          decimals: reserve.meta.decimals,
          asset_id: reserve.asset_id,
        })),
      ),
      removeAmount,
      Number(receiveAsset.id),
      pool.amplification.toString(),
      totalIssuance,
      scaleHuman(fee, 2),
      JSON.stringify(pool.pegs),
    )

    const value = Big(maxValue)
      .minus(Big(slippage).times(maxValue).div(100))
      .toFixed(0)

    return value
  }, [
    fee,
    pool.amplification,
    pool.pegs,
    receiveAsset.id,
    removeAmount,
    reserves,
    slippage,
    totalIssuance,
  ])

  useEffect(() => {
    if (!split && liquidityOutOneAsset) {
      const receiveAmount = toBig(liquidityOutOneAsset, receiveAsset.decimals)
      form.setValue("receiveAmount", receiveAmount.toFixed(0))
    }
  }, [form, split, liquidityOutOneAsset, receiveAsset.decimals])

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!receiveAssets) throw new Error("Receive assets not found")

      const tx = split
        ? papi.tx.Stableswap.remove_liquidity({
            pool_id: Number(pool.id),
            share_amount: BigInt(removeAmount),
            min_amounts_out: receiveAssets.map((asset) => ({
              amount: BigInt(asset.value),
              asset_id: Number(asset.asset.id),
            })),
          })
        : papi.tx.Stableswap.remove_liquidity_one_asset({
            pool_id: Number(pool.id),
            share_amount: BigInt(removeAmount),
            asset_id: Number(receiveAsset.id),
            min_amount_out: BigInt(
              scale(form.watch("receiveAmount"), receiveAsset.decimals),
            ),
          })

      const toasts = {
        submitted: t("liquidity.remove.stablepool.modal.toast.submitted", {
          value: removeAmountShifted,
          symbol: t("shares"),
        }),
        success: t("liquidity.remove.stablepool.modal.toast.success", {
          value: removeAmountShifted,
          symbol: t("shares"),
        }),
      }

      await createTransaction(
        {
          tx,
          toasts,
        },
        { onSubmitted },
      )
    },
  })

  const onSubmit = () => {
    mutation.mutate()
  }

  return {
    ...props,
    form,
    balance: balanceShifted,
    fee,
    receiveAssets,
    onSubmit,
    editable: true,
    isFullRemove: true,
    feesBreakdown: undefined,
    isRemoveShares: true,
    deposits: [],
  }
}

export const useRemoveStablepoolLiquidityForm = ({
  asset,
  balance,
  initialAmount,
  receiveAsset,
}: {
  asset?: TSelectedAsset
  receiveAsset: TAssetData
  balance: string
  initialAmount?: string
}) => {
  return useForm<TRemoveStablepoolLiquidityFormValues>({
    mode: "onChange",
    defaultValues: {
      amount: initialAmount ?? "",
      asset,
      split: true,
      receiveAsset,
      receiveAmount: "",
      option: "stablepool",
    },
    resolver: standardSchemaResolver(
      z.object({
        amount: required.pipe(positive).check(validateFieldMaxBalance(balance)),
        asset: z.custom<TSelectedAsset>(),
        split: z.boolean(),
        receiveAsset: z.custom<TAssetData>(),
        receiveAmount: z.string(),
        option: z.enum(["omnipool", "stablepool"]),
      }),
    ),
  })
}
