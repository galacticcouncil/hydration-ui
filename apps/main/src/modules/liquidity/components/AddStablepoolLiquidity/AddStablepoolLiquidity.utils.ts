import { calculate_shares } from "@galacticcouncil/math-stableswap"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { t } from "i18next"
import { useEffect } from "react"
import { ResolverOptions, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import z from "zod"

import { TAssetData } from "@/api/assets"
import { useOmnipoolFarms } from "@/api/farms"
import { StableSwapBase } from "@/api/pools"
import { useAddToOmnipoolZod } from "@/modules/liquidity/components/AddLiquidity/AddLiqudity.utils"
import { useMinOmnipoolFarmJoin } from "@/modules/liquidity/components/JoinFarms/JoinFarms.utils"
import {
  calculatePoolFee,
  isValidStablepoolToken,
} from "@/modules/liquidity/Liquidity.utils"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scale, scaleHuman } from "@/utils/formatting"
import {
  maxBalanceError,
  positive,
  required,
  validateMaxBalance,
} from "@/utils/validators"

export type TReserveFormValue = {
  asset: TAssetData
  amount: string
}

export type TAddStablepoolLiquidityFormValues = {
  reserves: Array<TReserveFormValue>
  sharesAmount: string
  option: "omnipool" | "stablepool"
  split: boolean
  selectedAssetId: string
}

export const addStablepoolOptions = [
  {
    id: "omnipool",
    label: t("liquidity:liquidity.add.modal.option.omnipool"),
    value: "omnipool",
  },
  {
    id: "stablepool",
    label: t("liquidity:liquidity.add.modal.option.stablepool"),
    value: "stablepool",
  },
]

export const useStablepoolAddLiquidity = ({
  pool,
}: {
  pool: StableSwapBase
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const { getAssetWithFallback } = useAssets()
  const { papi } = useRpcProvider()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const { getTransferableBalance } = useAccountBalances()
  const { data: omnipoolFarms } = useOmnipoolFarms()
  const {
    liquidity: { slippage },
  } = useTradeSettings()

  const poolId = pool.id.toString()
  const activeFarms =
    omnipoolFarms?.[poolId]?.filter((farm) => farm.apr !== "0") ?? []
  const isFarms = activeFarms.length > 0

  const stablepoolAssets = pool.tokens
    .filter(isValidStablepoolToken)
    .map((asset) => ({
      asset: getAssetWithFallback(asset.id),
      balance: asset.balance,
    }))
  const meta = getAssetWithFallback(pool.id)

  const accountReserveBalances = new Map(
    stablepoolAssets.map(({ asset }) => [
      asset.id,
      scaleHuman(getTransferableBalance(asset.id), asset.decimals),
    ]),
  )

  const form = useStablepoolAddLiquidityForm({
    poolId,
    selectedAssetId: stablepoolAssets[0]!.asset.id,
    reserves: stablepoolAssets.map(({ asset }) => ({
      asset,
      amount: "",
    })),
    accountReserveBalances,
  })
  const [reserves, split, option, selectedAssetId] = form.watch([
    "reserves",
    "split",
    "option",
    "selectedAssetId",
  ])

  const assetsToProvide = split
    ? reserves.filter(({ amount }) => Big(amount || "0").gt(0))
    : reserves.filter(
        ({ amount, asset }) =>
          Big(amount || "0").gt(0) && asset.id === selectedAssetId,
      )
  const stablepoolShares = getStablepoolShares(
    assetsToProvide,
    stablepoolAssets,
    pool,
  )

  const minStablepoolShares = Big(stablepoolShares)
    .times(100 - slippage)
    .div(100)
    .toFixed(0)

  const minJoinAmount = useMinOmnipoolFarmJoin(activeFarms, meta) || "0"
  const stablepoolSharesHuman =
    scaleHuman(minStablepoolShares, meta.decimals) || "0"
  const minReceiveAmount = stablepoolSharesHuman
  const isCheckJoinFarms =
    isFarms && Big(stablepoolSharesHuman).gt(0) && option === "omnipool"

  const joinFarmErrorMessage =
    isCheckJoinFarms && Big(stablepoolSharesHuman).lte(minJoinAmount)
      ? t("liquidity.joinFarms.modal.validation.minShares", {
          value: minJoinAmount,
          symbol: meta.symbol,
        })
      : undefined

  const isJoinFarms = isCheckJoinFarms && !joinFarmErrorMessage

  useEffect(() => {
    form.setValue("sharesAmount", stablepoolSharesHuman, {
      shouldValidate: true,
    })
  }, [form, stablepoolSharesHuman])

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!assetsToProvide.length) throw new Error("No assets to provide")

      const assetsToProvideFormatted = assetsToProvide.map(
        ({ asset, amount }) => ({
          asset_id: Number(asset.id),
          amount: BigInt(scale(amount, asset.decimals)),
        }),
      )

      const tx =
        option === "stablepool"
          ? papi.tx.Stableswap.add_assets_liquidity({
              pool_id: pool.id,
              assets: assetsToProvideFormatted,
              min_shares: BigInt(minStablepoolShares),
            })
          : papi.tx.OmnipoolLiquidityMining.add_liquidity_stableswap_omnipool_and_join_farms(
              {
                stable_pool_id: pool.id,
                stable_asset_amounts: assetsToProvideFormatted,
                farm_entries: isJoinFarms
                  ? activeFarms.map((farm) => [
                      farm.globalFarmId,
                      farm.yieldFarmId,
                    ])
                  : undefined,
              },
            )

      const toastValue = assetsToProvide
        .map(({ asset, amount }) =>
          t("common:number", {
            value: amount,
            symbol: asset.symbol,
          }),
        )
        .join(", ")

      const tOptions = {
        value: toastValue,
        where: "Stablepool",
      }

      const toasts = {
        submitted: t("liquidity.add.modal.toast.submitted", tOptions),
        success: t("liquidity.add.modal.toast.success", tOptions),
      }

      await createTransaction({
        tx,
        toasts,
      })
    },
  })

  return {
    form,
    accountReserveBalances,
    assetsToSelect: stablepoolAssets.map(({ asset }) => asset),
    minReceiveAmount,
    meta,
    mutation,
    activeFarms,
    isFarms,
    joinFarmErrorMessage,
    isJoinFarms,
    healthFactor: undefined,
  }
}

export const getStablepoolShares = (
  formValues: TReserveFormValue[],
  stablepoolAssets: Array<{ asset: TAssetData; balance: bigint }>,
  pool: StableSwapBase,
) => {
  const { amplification, totalIssuance, pegs, fee } = pool
  const calculatedFee = calculatePoolFee(fee)

  if (!calculatedFee) return 0

  const assetsFormatted = formValues
    .filter(({ amount }) => Big(amount || "0").gt(0))
    .map(({ asset, amount }) => ({
      asset_id: Number(asset.id),
      amount: scale(amount, asset.decimals),
    }))

  const reservesFormatted = stablepoolAssets.map(({ asset, balance }) => ({
    asset_id: Number(asset.id),
    amount: balance.toString(),
    decimals: asset.decimals,
  }))

  const shares = calculate_shares(
    JSON.stringify(reservesFormatted),
    JSON.stringify(assetsFormatted),
    amplification.toString(),
    totalIssuance.toString(),
    scaleHuman(calculatedFee, 2),
    JSON.stringify(pegs),
  )

  return Math.max(Number(shares), 0)
}

const useStablepoolAddLiquidityFormResolver = (
  poolId: string,
  accountReserveBalances: Map<string, string>,
) => {
  const omnipoolZodSchema = useAddToOmnipoolZod(poolId, true)

  return (
    values: TAddStablepoolLiquidityFormValues,
    context: unknown,
    options: ResolverOptions<TAddStablepoolLiquidityFormValues>,
  ) => {
    const reservesSchema = z.array(
      z
        .object({
          asset: z.custom<TAssetData>(),
          amount: z.string(),
        })
        .refine(
          (reserve) => {
            const maxBalance = accountReserveBalances.get(reserve.asset.id)
            if (!maxBalance) return true
            return validateMaxBalance(maxBalance, reserve.amount || "0")
          },
          {
            message: maxBalanceError,
          },
        ),
    )

    const schema = z.object({
      reserves: reservesSchema,
      sharesAmount: omnipoolZodSchema ?? required.pipe(positive),
      option: z.enum(["omnipool", "stablepool"]),
      split: z.boolean(),
      selectedAssetId: z.string(),
    })

    return standardSchemaResolver<
      TAddStablepoolLiquidityFormValues,
      unknown,
      TAddStablepoolLiquidityFormValues
    >(schema)(values, context, options)
  }
}

export const useStablepoolAddLiquidityForm = ({
  reserves,
  poolId,
  selectedAssetId,
  accountReserveBalances,
  option = "omnipool",
}: {
  poolId: string
  selectedAssetId: string
  reserves: Array<TReserveFormValue>
  option?: "omnipool" | "stablepool"
  accountReserveBalances: Map<string, string>
}) => {
  const resolver = useStablepoolAddLiquidityFormResolver(
    poolId,
    accountReserveBalances,
  )

  return useForm<TAddStablepoolLiquidityFormValues>({
    mode: "all",
    defaultValues: {
      reserves,
      option,
      sharesAmount: "",
      split: true,
      selectedAssetId,
    },
    resolver,
  })
}
