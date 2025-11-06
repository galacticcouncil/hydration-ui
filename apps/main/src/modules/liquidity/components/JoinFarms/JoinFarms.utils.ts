import { calculate_liquidity_out_asset_a } from "@galacticcouncil/math-xyk"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z, ZodType } from "zod/v4"

import { XykDeposit } from "@/api/account"
import { TAssetData } from "@/api/assets"
import { Farm } from "@/api/farms"
import { useOraclePrice } from "@/api/omnipool"
import { PoolToken, useXykPools } from "@/api/pools"
import { useXYKPoolsLiquidity } from "@/api/xyk"
import {
  IsolatedPoolTable,
  OmnipoolAssetTable,
} from "@/modules/liquidity/Liquidity.utils"
import { useAssets, XYKPoolMeta } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  AccountOmnipoolPosition,
  isDepositPosition,
  isOmnipoolDepositPosition,
} from "@/states/account"
import {
  TransactionOptions,
  TransactionToasts,
  useTransactionsStore,
} from "@/states/transactions"
import { scale, scaleHuman } from "@/utils/formatting"
import { required, validateFieldMaxBalance } from "@/utils/validators"

const LIQUIDITY_OUT_SHARES = "10000"

type JoinFarmsFormValues = { amount: string }

export const getMinimalDeposit = (farms: Farm[]) =>
  farms.length > 0
    ? farms.reduce(
        (acc, farm) => {
          const minDeposit = Big(farm.minDeposit.toString())

          return minDeposit.gt(acc.value)
            ? {
                value: minDeposit,
                assetId: farm.incentivizedAsset,
              }
            : acc
        },
        { value: Big(0), assetId: 0 },
      )
    : undefined

const getAvailableFarms = (
  farms: Farm[],
  position: AccountOmnipoolPosition | XykDeposit,
) =>
  isDepositPosition(position)
    ? farms.filter(
        (farm) =>
          !position.yield_farm_entries?.find(
            (entry) =>
              entry.global_farm_id === farm.globalFarmId &&
              entry.yield_farm_id === farm.yieldFarmId,
          ),
      )
    : farms

export const useJoinOmnipoolFarms = ({
  position,
  omnipoolAsset,
}: {
  position: AccountOmnipoolPosition
  omnipoolAsset: OmnipoolAssetTable
}) => {
  const { farms, meta, id: poolId } = omnipoolAsset
  const isDeposit = isOmnipoolDepositPosition(position)

  const availableFarms = getAvailableFarms(farms, position)

  const schema = useOmnipoolZodSchema({
    id: poolId,
    farms: availableFarms,
  })

  const mutation = useJoinOmnipoolFarmsMutation({
    farms: availableFarms,
    meta,
    positionId: position.positionId,
  })

  if (!schema) return undefined

  const onSubmit = () => {
    mutation.mutate({
      ...(isDeposit && { depositId: position.miningId }),
      amountHuman: position.data.currentTotalValueHuman,
    })
  }

  return {
    formValues: { amount: position.data.currentTotalValueHuman, rule: schema },
    displayValue: position.data.currentTotalDisplay,
    onSubmit,
    availableFarms,
    meta,
  }
}

export const useXYKFarmMinShares = (poolAddress: string, farms: Farm[]) => {
  const { data: pools } = useXykPools()

  const minDeposit = getMinimalDeposit(farms)

  const [assetAReserve, assetBReserve] =
    pools?.find((xykPool) => xykPool.address === poolAddress)?.tokens ?? []

  const { data: oracle } = useOraclePrice(
    assetAReserve?.id,
    assetBReserve?.id,
    "hydraxyk",
  )

  return useMemo(() => {
    if (
      !oracle ||
      !oracle.shares_issuance ||
      !assetAReserve?.decimals ||
      !minDeposit
    ) {
      return "0"
    }

    const liquidityOut = calculate_liquidity_out_asset_a(
      oracle.liquidity.a.toString(),
      oracle.liquidity.b.toString(),
      LIQUIDITY_OUT_SHARES,
      oracle.shares_issuance.toString(),
    )

    const valuedSharePrice = Big(liquidityOut)
      .div(LIQUIDITY_OUT_SHARES)
      .toString()

    const minShares = scale(
      Big(
        scaleHuman(
          Big(minDeposit.value).div(valuedSharePrice).toString(),
          assetAReserve.decimals,
        ),
      )
        .round(1, Big.roundUp)
        .toString(),
      assetAReserve.decimals,
    )

    return minShares
  }, [minDeposit, oracle, assetAReserve?.decimals])
}

export const useMinOmnipoolFarmJoin = (farms: Farm[], meta?: TAssetData) => {
  const minDeposit = getMinimalDeposit(farms)

  const { data: oracles } = useOraclePrice(
    minDeposit?.assetId,
    Number(meta?.id),
  )

  if (!oracles || !minDeposit || !meta) return undefined

  return Big(
    scaleHuman(
      minDeposit.value
        .times(oracles.price.d.toString())
        .div(oracles.price.n.toString())
        .toString(),
      meta.decimals,
    ),
  )
    .times(1.02)
    .toString()
}

export const useJoinIsolatedPoolFarms = ({
  xykData,
  positionId,
}: {
  xykData: IsolatedPoolTable
  positionId?: string
  options?: TransactionOptions
}) => {
  const {
    meta,
    farms,
    id: poolId,
    positions,
    balance = 0n,
    tvlDisplay,
  } = xykData
  const { data: liquidity } = useXYKPoolsLiquidity(poolId)

  const price = Big(tvlDisplay)
    .div(liquidity ? scaleHuman(liquidity, meta.decimals) : 1)
    .toString()

  const isDeposit = !!positionId

  const position = positions.find((position) => position.id === positionId)
  const availableFarms = position ? getAvailableFarms(farms, position) : farms

  const schema = useXYKJoinFarmsZodSchema({
    id: poolId,
    meta,
    farms: availableFarms,
  })

  const mutation = useJoinIsolatedPoolFarmsMutation({
    farms: availableFarms,
    tokens: xykData.tokens,
    meta,
  })

  const onSubmit = (amount: string) => {
    mutation.mutate({
      ...(isDeposit && { depositId: positionId }),
      amount: scale(amount, meta.decimals),
    })
  }

  if (!schema) return undefined

  if (isDeposit && position) {
    return {
      formValues: {
        amount: position.shares.toString(),
        rule: schema,
      },
      availableFarms,
      meta,
      onSubmit,
      displayValue: price
        ? Big(position.shares.toString()).times(price).toString()
        : undefined,
    }
  }

  const balanceHuman = scaleHuman(balance.toString(), meta.decimals)

  return {
    formValues: {
      amount: balanceHuman,
      rule: schema.check(validateFieldMaxBalance(balanceHuman)),
    },
    availableFarms,
    meta,
    onSubmit,
    isEditable: true,
  }
}

const useJoinOmnipoolFarmsMutation = ({
  farms,
  positionId,
  options,
  meta,
}: {
  farms: Farm[]
  positionId: string
  meta: TAssetData
  options?: TransactionOptions
}) => {
  const { t } = useTranslation("liquidity")
  const { papi } = useRpcProvider()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  return useMutation({
    mutationFn: async ({
      depositId,
      amountHuman,
    }: {
      depositId?: string
      amountHuman: string
    }) => {
      if (!farms.length) throw new Error("There are no farms to join")
      if (!meta) throw new Error("Missing asset meta")

      const executeRedeposit = async (depositId: string, farms: Farm[]) => {
        const txs = farms.map((farm) =>
          papi.tx.OmnipoolLiquidityMining.redeposit_shares({
            global_farm_id: farm.globalFarmId,
            yield_farm_id: farm.yieldFarmId,
            deposit_id: BigInt(depositId),
          }),
        )

        await createTransaction(
          {
            tx:
              txs.length > 1
                ? papi.tx.Utility.batch_all({
                    calls: txs.map((t) => t.decodedCall),
                  })
                : txs[0]!,
          },
          options,
        )
      }

      if (!depositId) {
        const tx = papi.tx.OmnipoolLiquidityMining.join_farms({
          farm_entries: farms.map((farm) => [
            farm.globalFarmId,
            farm.yieldFarmId,
          ]),
          position_id: BigInt(positionId),
        })

        const toasts: TransactionToasts = {
          submitted: t("liquidity.joinFarms.modal.join.toast.submitted", {
            value: amountHuman,
            symbol: meta.symbol,
          }),
          success: t("liquidity.joinFarms.modal.join.toast.success", {
            value: amountHuman,
            symbol: meta.symbol,
          }),
        }

        await createTransaction(
          {
            tx,
            toasts,
          },
          options,
        )
      } else {
        await executeRedeposit(depositId, farms)
      }
    },
  })
}

const useJoinIsolatedPoolFarmsMutation = ({
  farms,
  tokens,
  meta,
  options,
}: {
  farms: Farm[]
  tokens: [PoolToken, PoolToken]
  meta: XYKPoolMeta
  options?: TransactionOptions
}) => {
  const { papi } = useRpcProvider()
  const { t } = useTranslation("liquidity")
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  return useMutation({
    mutationFn: async ({
      depositId,
      amount,
    }: {
      depositId?: string
      amount: string
    }) => {
      const [farm] = farms
      if (!farm) throw new Error("There are no farms to join")

      const executeRedeposit = async (depositId: string, farms: Farm[]) => {
        const txs = farms.map((farm) =>
          papi.tx.XYKLiquidityMining.redeposit_shares({
            global_farm_id: farm.globalFarmId,
            yield_farm_id: farm.yieldFarmId,
            deposit_id: BigInt(depositId),
            asset_pair: {
              asset_in: tokens[0].id,
              asset_out: tokens[1].id,
            },
          }),
        )

        await createTransaction(
          {
            tx:
              txs.length > 1
                ? papi.tx.Utility.batch_all({
                    calls: txs.map((t) => t.decodedCall),
                  })
                : txs[0]!,
          },
          options,
        )
      }

      if (!depositId) {
        const tx = papi.tx.XYKLiquidityMining.join_farms({
          farm_entries: farms.map((farm) => [
            farm.globalFarmId,
            farm.yieldFarmId,
          ]),
          asset_pair: {
            asset_in: tokens[0].id,
            asset_out: tokens[1].id,
          },
          shares_amount: BigInt(amount),
        })

        const toasts: TransactionToasts = {
          submitted: t("liquidity.joinFarms.modal.join.toast.submitted", {
            value: scaleHuman(amount, meta.decimals),
            symbol: meta.symbol,
          }),
          success: t("liquidity.joinFarms.modal.join.toast.success", {
            value: scaleHuman(amount, meta.decimals),
            symbol: meta.symbol,
          }),
        }

        await createTransaction(
          {
            tx,
            toasts,
          },
          options,
        )
      } else {
        await executeRedeposit(depositId, farms)
      }
    },
  })
}

export type TJoinFarmsForm = {
  amount: string
  rule: ZodType<string, string>
}

export const useJoinFarmsForm = ({ amount, rule }: TJoinFarmsForm) => {
  return useForm<JoinFarmsFormValues>({
    mode: "onChange",
    defaultValues: { amount },
    resolver: standardSchemaResolver(z.object({ amount: rule })),
  })
}

const useOmnipoolZodSchema = ({ id, farms }: { id: string; farms: Farm[] }) => {
  const { t } = useTranslation("liquidity")
  const { getAssetWithFallback } = useAssets()

  const meta = getAssetWithFallback(id)
  const minJoinAmount = useMinOmnipoolFarmJoin(farms, meta)

  if (!minJoinAmount) return undefined

  return required.refine((value) => Big(value).gte(minJoinAmount), {
    error: t("liquidity.joinFarms.modal.validation.minShares", {
      value: minJoinAmount,
      symbol: meta.symbol,
    }),
  })
}

const useXYKJoinFarmsZodSchema = ({
  id,
  meta,
  farms,
}: {
  id: string
  farms: Farm[]
  meta: XYKPoolMeta
}) => {
  const { t } = useTranslation("liquidity")
  const minJoinAmount = useXYKFarmMinShares(id, farms)

  if (!minJoinAmount) return undefined

  const minJoinAmountHuman = scaleHuman(minJoinAmount, meta.decimals)

  return required.refine((value) => Big(value).gte(minJoinAmountHuman), {
    error: t("liquidity.joinFarms.modal.validation.minShares", {
      value: minJoinAmountHuman,
      symbol: meta.symbol,
    }),
  })
}
