import {
  calculate_liquidity_hub_in,
  calculate_shares,
  is_add_liquidity_allowed,
  verify_asset_cap,
} from "@galacticcouncil/math-omnipool"
import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { FieldError, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z, ZodType } from "zod/v4"

import { AAVE_GAS_LIMIT, healthFactorAfterWithdrawQuery } from "@/api/aave"
import { omnipoolMiningPositionsKey, omnipoolPositionsKey } from "@/api/account"
import { TAssetData } from "@/api/assets"
import { useOmnipoolFarms } from "@/api/farms"
import {
  useMaxAddLiquidityLimit,
  useOmnipoolAssetsData,
  useOmnipoolMinLiquidity,
} from "@/api/omnipool"
import i18n from "@/i18n"
import { useMinOmnipoolFarmJoin } from "@/modules/liquidity/components/JoinFarms/JoinFarms.utils"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scale, scaleHuman } from "@/utils/formatting"
import { toDecimal } from "@/utils/formatting"
import { positive, required, validateMaxBalance } from "@/utils/validators"

export type TAddLiquidityFormValues = { amount: string; asset: TAssetData }

export const getCustomErrors = (errors?: FieldError) =>
  errors
    ? (errors as unknown as {
        cap?: { message: string }
        circuitBreaker?: { message: string }
      })
    : undefined

export const useLiquidityOmnipoolShares = (assetId: string) => {
  const { dataMap: omnipoolAssetsData } = useOmnipoolAssetsData()
  const {
    liquidity: { slippage },
  } = useTradeSettings()
  const omnipoolAssetData = omnipoolAssetsData?.get(Number(assetId))

  const getOmnipoolGetShares = (value: string) => {
    if (!omnipoolAssetData || !value) return undefined

    const {
      hubReserves,
      shares,
      balance: assetReserve,
      decimals,
    } = omnipoolAssetData

    const sharesToGet = calculate_shares(
      assetReserve.toString(),
      hubReserves.toString(),
      shares.toString(),
      scale(value, decimals ?? 0),
    )

    const minSharesToGet = Big(sharesToGet)
      .times(100 - slippage)
      .div(100)
      .toFixed(0)

    const totalShares = Big(shares.toString()).plus(minSharesToGet).toString()
    const poolShare = Big(minSharesToGet).div(totalShares).times(100).toString()

    return { totalShares, poolShare, sharesToGet, minSharesToGet }
  }

  return getOmnipoolGetShares
}

export const useCheckJoinOmnipoolFarm = ({
  amount,
  meta,
  disabled = false,
}: {
  amount: string
  meta: TAssetData
  disabled?: boolean
}) => {
  const { t } = useTranslation("liquidity")
  const { data: omnipoolFarms } = useOmnipoolFarms()

  const activeFarms =
    omnipoolFarms?.[meta.id]?.filter((farm) => farm.apr !== "0") ?? []
  const minJoinAmount = useMinOmnipoolFarmJoin(activeFarms, meta) || "0"

  const isCheckJoinFarms =
    activeFarms.length > 0 && Big(amount).gt(0) && !disabled
  const joinFarmErrorMessage =
    isCheckJoinFarms && Big(amount).lte(minJoinAmount)
      ? t("liquidity.joinFarms.modal.validation.minShares", {
          value: minJoinAmount,
          symbol: meta.symbol,
        })
      : undefined

  const isJoinFarms = isCheckJoinFarms && !joinFarmErrorMessage

  return {
    activeFarms,
    isJoinFarms,
    joinFarmErrorMessage,
  }
}

export const useAddToOmnipoolZod = (poolId: string) => {
  const { getAssetWithFallback } = useAssets()
  const { t } = useTranslation("liquidity")

  const { dataMap: omnipoolAssetsData, hubToken } = useOmnipoolAssetsData()
  const { data: minPoolLiquidity } = useOmnipoolMinLiquidity()
  const { data: maxAddLiquidityLimit } = useMaxAddLiquidityLimit()

  const omnipoolAssetData = omnipoolAssetsData?.get(Number(poolId))
  const hubBalance = hubToken?.balance

  if (
    !minPoolLiquidity ||
    !omnipoolAssetData ||
    !hubBalance ||
    !maxAddLiquidityLimit
  )
    return undefined

  const poolMeta = getAssetWithFallback(poolId)

  const { decimals, symbol } = poolMeta
  const { balance: assetReserve, hubReserves, shares, cap } = omnipoolAssetData

  const circuitBreakerLimit = scaleHuman(
    Big(maxAddLiquidityLimit).times(assetReserve.toString()).toString(),
    decimals,
  )

  const rules = required
    .pipe(positive)
    .refine(
      (value) => Big(scale(value, decimals)).gte(minPoolLiquidity.toString()),
      {
        error: t("liquidity.add.modal.validation.minPoolLiquidity"),
      },
    )
    .refine(
      (value) => {
        if (!value) return true

        const hubIn = calculate_liquidity_hub_in(
          assetReserve.toString(),
          hubReserves.toString(),
          shares.toString(),
          scale(value, decimals),
        )

        const isWithinLimit = verify_asset_cap(
          hubReserves.toString(),
          cap.toString(),
          hubIn,
          hubBalance.toString(),
        )

        return isWithinLimit
      },
      {
        error: t("liquidity.add.modal.validation.cap"),
        path: ["cap"],
      },
    )
    .refine(
      (value) => {
        if (!value) return true

        return Big(circuitBreakerLimit).gte(value)
      },
      {
        error: t("liquidity.add.modal.validation.circuitBreaker", {
          amount: circuitBreakerLimit,
          symbol,
        }),
        path: ["circuitBreaker"],
      },
    )

  return rules
}

export const useAddLiquidityForm = ({
  initialAmount,
  selectedAsset,
  rule,
}: {
  selectedAsset: TAssetData
  initialAmount?: string
  rule?: ZodType<string, string> | undefined
}) => {
  const { getTransferableBalance } = useAccountBalances()

  const form = useForm<TAddLiquidityFormValues>({
    mode: "onChange",
    defaultValues: { amount: initialAmount ?? "", asset: selectedAsset },
    resolver: rule
      ? standardSchemaResolver(
          z.object({ amount: rule, asset: z.custom<TAssetData>() }).refine(
            (values) => {
              return validateMaxBalance(
                toDecimal(
                  getTransferableBalance(values.asset.id),
                  values.asset.decimals,
                ),
                values.amount,
              )
            },
            {
              message: i18n.t("error.maxBalance"),
              path: ["amount"],
            },
          ),
        )
      : undefined,
  })

  return form
}

export const useAddLiquidity = ({
  poolId,
  onSubmitted,
}: {
  poolId: string
  onSubmitted: () => void
}) => {
  const getToasts = useAddToOmnipoolToasts()
  const rpc = useRpcProvider()

  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const { getAssetWithFallback, isErc20AToken, getErc20AToken } = useAssets()
  const { account } = useAccount()
  const { dataMap } = useOmnipoolAssetsData()
  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()

  const poolMeta = getAssetWithFallback(poolId)
  const isErc20Asset = isErc20AToken(poolMeta)
  const { papi, sdk } = rpc

  const omnipoolAsset = dataMap?.get(Number(poolId))
  const canAddLiquidity = omnipoolAsset?.tradeable
    ? is_add_liquidity_allowed(omnipoolAsset.tradeable)
    : false

  const addLiquidityZod = useAddToOmnipoolZod(poolId)
  const underlyingAssetId = isErc20Asset
    ? getErc20AToken(poolId)?.underlyingAssetId
    : undefined

  const form = useAddLiquidityForm({
    initialAmount: "",
    selectedAsset: poolMeta,
    rule: addLiquidityZod,
  })

  const amount = Big(form.watch("amount") || "0")
  const selectedAsset = form.watch("asset")

  const { isJoinFarms, joinFarmErrorMessage, activeFarms } =
    useCheckJoinOmnipoolFarm({
      amount: amount.toString(),
      meta: poolMeta,
    })
  const isFarms = activeFarms.length > 0
  const getOmnipoolGetShares = useLiquidityOmnipoolShares(poolId)
  const liquidityShares = getOmnipoolGetShares(amount.toString())

  const { data: healthFactor } = useQuery(
    healthFactorAfterWithdrawQuery(rpc, {
      address: account?.address ?? "",
      fromAssetId: isErc20AToken(poolMeta) ? poolMeta.underlyingAssetId : "",
      fromAmount: amount.toString(),
    }),
  )

  const mutation = useMutation({
    mutationFn: async ({
      amount,
      shares,
    }: {
      amount: string
      shares: string
    }): Promise<void> => {
      if (!account?.address) {
        throw new Error("No connected account")
      }

      const getSwapTx = async () => {
        const swap = await sdk.api.router.getBestSell(
          Number(selectedAsset.id),
          Number(poolId),
          toDecimal(shares, poolMeta.decimals),
        )

        return await sdk.tx
          .trade(swap)
          .withSlippage(swapSlippage)
          .withBeneficiary(account.address)
          .build()
          .then((tx) => tx.get())
      }

      const provideLiquidityTx = isJoinFarms
        ? papi.tx.OmnipoolLiquidityMining.add_liquidity_and_join_farms({
            asset: Number(poolId),
            amount: BigInt(amount),
            min_shares_limit: BigInt(shares),
            farm_entries: activeFarms.map((farm) => [
              farm.globalFarmId,
              farm.yieldFarmId,
            ]),
          })
        : papi.tx.Omnipool.add_liquidity_with_limit({
            asset: Number(poolId),
            amount: BigInt(amount),
            min_shares_limit: BigInt(shares),
          })

      const validedProvideLiquidityTx = isErc20Asset
        ? papi.tx.Dispatcher.dispatch_with_extra_gas({
            call: provideLiquidityTx.decodedCall,
            extra_gas: AAVE_GAS_LIMIT,
          })
        : provideLiquidityTx

      const tx =
        selectedAsset.id === poolId
          ? validedProvideLiquidityTx
          : papi.tx.Utility.batch_all({
              calls: [await getSwapTx(), validedProvideLiquidityTx].map(
                (t) => t.decodedCall,
              ),
            })

      await createTransaction(
        {
          tx,
          toasts: getToasts(amount, poolMeta, isJoinFarms),
          invalidateQueries: [
            omnipoolPositionsKey(account?.address ?? ""),
            omnipoolMiningPositionsKey(account?.address ?? ""),
          ],
        },
        { onSubmitted },
      )
    },
  })

  const onSubmit = async (values: TAddLiquidityFormValues) => {
    if (!liquidityShares || !values.amount)
      throw new Error("Invalid input data")

    const amount = scale(values.amount, poolMeta.decimals).toString()
    mutation.mutate({
      amount,
      shares: liquidityShares.minSharesToGet,
    })
  }

  return {
    form,
    liquidityShares,
    isFarms,
    activeFarms,
    poolMeta,
    joinFarmErrorMessage,
    isJoinFarms,
    canAddLiquidity,
    onSubmit,
    healthFactor,
    underlyingAssetMeta: underlyingAssetId
      ? getAssetWithFallback(underlyingAssetId)
      : undefined,
  }
}

const useAddToOmnipoolToasts = () => {
  const { t } = useTranslation(["liquidity", "common"])

  return (amount: string, meta: TAssetData, isJoinFarms: boolean) => {
    const shiftedAmount = scaleHuman(amount, meta.decimals)
    const tOptions = {
      value: t("common:currency", {
        value: shiftedAmount,
        symbol: meta.symbol,
      }),
      where: t("omnipool"),
    }

    return {
      submitted: t(
        isJoinFarms
          ? "liquidity.add.joinFarms.modal.toast.submitted"
          : "liquidity.add.modal.toast.submitted",
        tOptions,
      ),
      success: t(
        isJoinFarms
          ? "liquidity.add.joinFarms.modal.toast.success"
          : "liquidity.add.modal.toast.success",
        tOptions,
      ),
    }
  }
}
