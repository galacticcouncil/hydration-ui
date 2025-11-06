import { calculate_shares } from "@galacticcouncil/math-xyk"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import z from "zod/v4"

import { TAssetData } from "@/api/assets"
import { useIsolatedPoolsFarms } from "@/api/farms"
import { PoolBase, PoolToken } from "@/api/pools"
import { spotPriceQuery } from "@/api/spotPrice"
import { TXYKConsts, useXYKPoolsLiquidity } from "@/api/xyk"
import { useXYKFarmMinShares } from "@/modules/liquidity/components/JoinFarms/JoinFarms.utils"
import { useAssets, XYKPoolMeta } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useTransactionsStore } from "@/states/transactions"
import { scale, scaleHuman } from "@/utils/formatting"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

export const orders = ["assetA", "assetB"] as const
type Order = (typeof orders)[number]

export type TAddIsolatedLiquidityFormValues = {
  lastUpdated: Order
  shares: string
  amountA: string
  amountB: string
  assetA: TAssetData
  assetB: TAssetData
}

export const getTradeFee = (fee?: number[]) => {
  if (fee?.length !== 2) return

  const numerator = fee[0]
  const denominator = fee[1]

  if (!numerator || !denominator) return undefined

  const tradeFee = Big(numerator).div(denominator)

  return tradeFee.times(100).toString()
}

export const useAddIsolatedLiquidityZod = (
  balanceA: string,
  balanceB: string,
  minTradingLimit: bigint,
  minPoolLiquidity: bigint,
) => {
  const { t } = useTranslation("liquidity")

  return z
    .object({
      amountA: required.pipe(positive).check(validateFieldMaxBalance(balanceA)),
      amountB: required.check(validateFieldMaxBalance(balanceB)),
      assetA: z.custom<TAssetData>(),
      assetB: z.custom<TAssetData>(),
      lastUpdated: z.literal(["assetA", "assetB"]),
      shares: z
        .string()
        .refine((shares) => Big(shares).gt(minPoolLiquidity.toString()), {
          error: t("liquidity.add.modal.validation.minPoolLiquidity"),
        }),
    })
    .refine(
      ({ amountA, assetA }) => {
        const minAssetATradingLimit = Big(
          scale(amountA || "0", assetA.decimals),
        ).gt(minTradingLimit.toString())

        return minAssetATradingLimit
      },
      {
        error: t("liquidity.add.modal.validation.minPoolLiquidity"),
        path: ["amountA"],
      },
    )

    .refine(
      ({ amountB, assetB }) => {
        const minAssetBTradingLimit = Big(
          scale(amountB || "0", assetB.decimals),
        ).gt(minTradingLimit.toString())

        return minAssetBTradingLimit
      },
      {
        error: t("liquidity.add.modal.validation.minPoolLiquidity"),
        path: ["amountB"],
      },
    )
}

type AddIsolatedLiquidityZodSchema = NonNullable<
  ReturnType<typeof useAddIsolatedLiquidityZod>
>

export const useAddIsolatedLiquidity = (pool: PoolBase, consts: TXYKConsts) => {
  const rpc = useRpcProvider()
  const { t } = useTranslation("liquidity")
  const { papi } = useRpcProvider()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const { getAssetWithFallback, getMetaFromXYKPoolTokens } = useAssets()
  const { getTransferableBalance } = useAccountBalances()
  const { data: liquidity, isLoading } = useXYKPoolsLiquidity(pool.address)
  const { data: farms } = useIsolatedPoolsFarms()
  const activeFarms =
    farms?.[pool.address]?.filter((farm) => farm.apr !== "0") ?? []
  const isFarms = activeFarms.length > 0

  const [assetA, assetB] = pool.tokens as [PoolToken, PoolToken]

  const assetAMeta = getAssetWithFallback(assetA.id)
  const assetBMeta = getAssetWithFallback(assetB.id)
  const reserveA = assetA.balance.toString()
  const reserveB = assetB.balance.toString()

  const meta = getMetaFromXYKPoolTokens(pool.address, [
    assetA,
    assetB,
  ]) as XYKPoolMeta

  const assetABalance = scaleHuman(
    getTransferableBalance(assetAMeta.id),
    assetAMeta.decimals,
  )
  const assetBBalance = scaleHuman(
    getTransferableBalance(assetBMeta.id),
    assetBMeta.decimals,
  )

  const { data: spotPriceData, isPending: isSpotPricePending } = useQuery(
    spotPriceQuery(rpc, assetAMeta.id, assetBMeta.id),
  )

  const zodSchema = useAddIsolatedLiquidityZod(
    assetABalance,
    assetBBalance,
    pool.minTradingLimit,
    consts.minPoolLiquidity,
  )

  const form = useAddIsolatedLiquidityForm({
    assetA: assetAMeta,
    assetB: assetBMeta,
    rule: zodSchema,
  })

  const getShares = useCallback(
    (amountA: string) =>
      liquidity && assetA && amountA.length
        ? calculate_shares(
            assetA.balance.toString(),
            scale(amountA, assetA.decimals ?? 0),
            liquidity.toString(),
          )
        : "0",
    [liquidity, assetA],
  )

  const shares = form.watch("shares")
  const ratio =
    liquidity && shares
      ? Big(shares)
          .div(Big(liquidity.toString()).plus(shares))
          .times(100)
          .toString()
      : undefined

  const minJoinAmount = useXYKFarmMinShares(pool.address, activeFarms)

  const isCheckJoinFarms = isFarms && Big(shares).gt(0)
  const joinFarmErrorMessage =
    isCheckJoinFarms && Big(shares).lte(minJoinAmount)
      ? t("liquidity.joinFarms.modal.validation.minShares", {
          value: scaleHuman(minJoinAmount, meta.decimals),
          symbol: meta.symbol,
        })
      : undefined

  const isJoinFarms = isCheckJoinFarms && !joinFarmErrorMessage

  const mutation = useMutation({
    mutationFn: async ({
      assetA,
      assetB,
      amountA,
      amountB,
    }: {
      assetA: TAssetData
      assetB: TAssetData
      amountA: string
      amountB: string
    }): Promise<void> => {
      const tx = isJoinFarms
        ? papi.tx.XYKLiquidityMining.add_liquidity_and_join_farms({
            asset_a: Number(assetA.id),
            asset_b: Number(assetB.id),
            amount_a: BigInt(Big(scale(amountA, assetA.decimals)).toFixed(0)),
            amount_b_max_limit: BigInt(
              Big(scale(amountB, assetB.decimals)).toFixed(0),
            ),
            farm_entries: activeFarms.map((farm) => [
              farm.globalFarmId,
              farm.yieldFarmId,
            ]),
          })
        : papi.tx.XYK.add_liquidity({
            asset_a: Number(assetA.id),
            asset_b: Number(assetB.id),
            amount_a: BigInt(Big(scale(amountA, assetA.decimals)).toFixed(0)),
            amount_b_max_limit: BigInt(
              Big(scale(amountB, assetB.decimals)).toFixed(0),
            ),
          })

      const sharesHuman = scaleHuman(shares, meta.decimals)

      await createTransaction({
        tx,
        toasts: {
          submitted: t("liquidity.add.modal.xyk.toast.submitted", {
            shares: sharesHuman,
          }),
          success: t("liquidity.add.modal.xyk.toast.success", {
            shares: sharesHuman,
          }),
          error: t("liquidity.add.modal.xyk.toast.submitted", {
            shares: sharesHuman,
          }),
        },
      })
    },
  })

  return {
    form,
    reserveA,
    reserveB,
    ratio,
    mutation,
    isLoading,
    assetABalance,
    assetBBalance,
    assetAMeta,
    assetBMeta,
    meta,
    shares,
    getShares,
    price: spotPriceData?.spotPrice?.toString(),
    isPriceLoading: isSpotPricePending,
    activeFarms,
    isJoinFarms,
    joinFarmErrorMessage,
  }
}

const useAddIsolatedLiquidityForm = ({
  assetA,
  assetB,
  rule,
}: {
  assetA: TAssetData
  assetB: TAssetData
  rule?: AddIsolatedLiquidityZodSchema | undefined
}) => {
  return useForm<TAddIsolatedLiquidityFormValues>({
    mode: "onChange",
    defaultValues: {
      lastUpdated: "assetA",
      shares: "0",
      amountA: "",
      amountB: "",
      assetA,
      assetB,
    },
    resolver: rule ? standardSchemaResolver(rule) : undefined,
  })
}
