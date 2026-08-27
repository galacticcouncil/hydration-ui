import { calculate_shares } from "@galacticcouncil/math-xyk"
import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import z from "zod/v4"

import { xykMiningPositionsKey } from "@/api/account"
import { TAssetData } from "@/api/assets"
import { useIsolatedPoolFarms } from "@/api/farms"
import { PoolToken } from "@/api/pools"
import { spotPriceQuery } from "@/api/spotPrice"
import { TXYKConsts, XYKPoolWithLiquidity } from "@/api/xyk"
import { useXYKFarmMinShares } from "@/modules/liquidity/components/JoinFarms/JoinFarms.utils"
import {
  useFormMaxBalanceWithFee,
  ValidateFormMaxBalanceWithFee,
} from "@/modules/transactions/hooks/useFormMaxBalanceWithFee"
import { TShareToken } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { scale, scaleHuman } from "@/utils/formatting"
import { positive, required } from "@/utils/validators"

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

export const useAddIsolatedLiquidityZod = (
  validateBalance: ValidateFormMaxBalanceWithFee,
  minTradingLimit: bigint,
  minPoolLiquidity: bigint,
) => {
  const { t } = useTranslation("liquidity")

  return z
    .object({
      amountA: required.pipe(positive),
      amountB: required,
      assetA: z.custom<TAssetData>(),
      assetB: z.custom<TAssetData>(),
      lastUpdated: z.literal(["assetA", "assetB"]),
      shares: z
        .string()
        .refine((shares) => Big(shares).gt(minPoolLiquidity.toString()), {
          error: t("liquidity.add.modal.validation.minPoolLiquidity"),
        }),
    })
    .check(
      validateBalance("amountA", (form) => [form.assetA, form.amountA]),
      validateBalance("amountB", (form) => [form.assetB, form.amountB]),
    )
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

export const useAddIsolatedLiquidity = ({
  pool,
  consts,
  shareTokenMeta,
  onSubmitted,
}: {
  pool: XYKPoolWithLiquidity
  consts: TXYKConsts
  shareTokenMeta: TShareToken
  onSubmitted: () => void
}) => {
  const { account } = useAccount()
  const rpc = useRpcProvider()
  const { t } = useTranslation("liquidity")
  const { papi } = useRpcProvider()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const { data: farms } = useIsolatedPoolFarms(shareTokenMeta.poolAddress)
  const activeFarms = farms?.filter((farm) => farm.apr !== "0") ?? []
  const isFarms = activeFarms.length > 0

  const liquidity = pool.totalLiquidity
  const [assetA, assetB] = pool.tokens as [PoolToken, PoolToken]

  const reserveA = assetA.balance.toString()
  const reserveB = assetB.balance.toString()

  const [assetAMeta, assetBMeta] = shareTokenMeta.assets

  const { data: spotPriceData, isPending: isSpotPricePending } = useQuery(
    spotPriceQuery(rpc, assetAMeta.id, assetBMeta.id),
  )

  const addLiquidityTx = papi.tx.XYK.add_liquidity({
    asset_a: Number(assetAMeta.id),
    asset_b: Number(assetBMeta.id),
    amount_a: BigInt(scale("1", assetAMeta.decimals)),
    amount_b_max_limit: BigInt(scale("1", assetBMeta.decimals)),
  })

  const { validateBalance, getMaxBalance } =
    useFormMaxBalanceWithFee(addLiquidityTx)

  const zodSchema = useAddIsolatedLiquidityZod(
    validateBalance,
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
          value: scaleHuman(minJoinAmount, shareTokenMeta.decimals),
          symbol: shareTokenMeta.symbol,
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

      const sharesHuman = scaleHuman(shares, shareTokenMeta.decimals)

      await createTransaction(
        {
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
          invalidateQueries: [xykMiningPositionsKey(account?.address ?? "")],
        },
        { onSubmitted },
      )
    },
  })

  return {
    form,
    getMaxBalance,
    reserveA,
    reserveB,
    ratio,
    mutation,
    assetAMeta,
    assetBMeta,
    shares,
    getShares,
    price: spotPriceData?.spotPrice,
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
