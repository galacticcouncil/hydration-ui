import {
  calculate_liquidity_hub_in,
  calculate_shares,
  verify_asset_cap,
} from "@galacticcouncil/math-omnipool"
import { useMaxAddLiquidityLimit } from "api/consts"
import {
  useOmnipoolFee,
  useOmnipoolMinLiquidity,
  useOmnipoolDataObserver,
  TOmnipoolAssetsData,
} from "api/omnipool"
import BigNumber from "bignumber.js"
import { useMemo } from "react"
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { maxBalance, positive, required } from "utils/validators"
import { scale, scaleHuman } from "utils/balance"
import { TFarmAprData, useOraclePrice } from "api/farms"
import { BN_0, BN_NAN } from "utils/constants"
import BN from "bignumber.js"
import { ApiPromise } from "@polkadot/api"
import { useXYKConsts } from "api/xyk"
import { useEstimatedFees } from "api/transaction"
import { usePoolData } from "sections/pools/pool/Pool"
import { TAsset } from "providers/assets"
import { useAccountBalances } from "api/deposits"
import { isStablepoolType } from "sections/pools/PoolsPage.utils"

export const getAddToOmnipoolFee = (
  api: ApiPromise,
  isJoinFarms: boolean,
  farms: TFarmAprData[],
) => {
  const tx = isJoinFarms
    ? api.tx.omnipoolLiquidityMining.addLiquidityAndJoinFarms(
        farms.map<[string, string]>((farm) => [
          farm.globalFarmId,
          farm.yieldFarmId,
        ]),
        "0",
        "1",
        //@ts-ignore
        undefined,
      )
    : api.tx.omnipool.addLiquidity("0", "1")

  return [tx]
}

export const getSharesToGet = (
  omnipoolAsset: TOmnipoolAssetsData[number],
  amount: string,
) => {
  if (BigNumber(amount).isNaN()) return BN_NAN

  const { hubReserve, shares, balance } = omnipoolAsset

  const assetReserve = balance.toString()

  if (assetReserve && hubReserve && shares && amount) {
    const sharesToGet = calculate_shares(
      assetReserve,
      hubReserve.toString(),
      shares.toString(),
      amount,
    )

    return BN(sharesToGet)
  }

  return BN_NAN
}

export const useAddLiquidity = (assetId: string, assetValue?: string) => {
  const omnipoolAssets = useOmnipoolDataObserver()
  const { pool } = usePoolData()
  const ommipoolAsset = omnipoolAssets.dataMap?.get(assetId)

  const { data: omnipoolFee } = useOmnipoolFee()

  const { data: accountAssets } = useAccountBalances()
  const assetBalance = accountAssets?.accountAssetsMap.get(assetId)?.balance

  const { poolShare, sharesToGet, totalShares } = useMemo(() => {
    if (ommipoolAsset && assetValue) {
      const sharesToGet = getSharesToGet(
        ommipoolAsset,
        scale(assetValue, pool.meta.decimals).toString(),
      )

      const totalShares = BigNumber(ommipoolAsset.shares).plus(sharesToGet)
      const poolShare = BigNumber(sharesToGet).div(totalShares).times(100)

      return { poolShare, sharesToGet, totalShares: ommipoolAsset.shares }
    }

    return { poolShare: BN_0, sharesToGet: BN_0, totalShares: BN_0 }
  }, [assetValue, ommipoolAsset, pool.meta.decimals])

  return {
    totalShares,
    poolShare,
    sharesToGet,
    omnipoolFee,
    assetMeta: pool.meta,
    assetBalance,
    ommipoolAsset,
    isGETH: isStablepoolType(pool) && pool.isGETH,
  }
}

export const useAddToOmnipoolZod = (
  assetId: string,
  farms: TFarmAprData[],
  isStablepool?: boolean,
) => {
  const { t } = useTranslation()
  const { pool } = usePoolData()

  const { decimals, symbol } = pool.meta

  const { data: minPoolLiquidity } = useOmnipoolMinLiquidity()

  const { data: accountAssets } = useAccountBalances()
  const assetBalance = accountAssets?.accountAssetsMap.get(assetId)?.balance

  const omnipoolAssets = useOmnipoolDataObserver()
  const omnipoolAsset = omnipoolAssets.dataMap?.get(assetId)
  const hubBalance = omnipoolAssets.hubToken?.balance

  const { data: maxAddLiquidityLimit } = useMaxAddLiquidityLimit()

  const isFarms = farms.length

  const minDeposit = useMemo(() => {
    return farms.reduce<{ value: BigNumber; assetId?: string }>(
      (acc, farm) => {
        const minDeposit = BN(farm.minDeposit)

        return minDeposit.gt(acc.value)
          ? {
              value: minDeposit,
              assetId: farm.incentivizedAsset,
            }
          : acc
      },
      { value: BN_0, assetId: undefined },
    )
  }, [farms])

  const { data: oraclePrice } = useOraclePrice(
    isFarms ? minDeposit.assetId : undefined,
    assetId,
  )

  if (
    minPoolLiquidity === undefined ||
    omnipoolAsset === undefined ||
    hubBalance === undefined ||
    maxAddLiquidityLimit === undefined
  )
    return undefined

  const assetReserve = omnipoolAsset.balance
  const assetHubReserve = omnipoolAsset.hubReserve
  const assetShares = omnipoolAsset.shares
  const assetCap = omnipoolAsset.cap
  const totalHubReserve = hubBalance

  const circuitBreakerLimit = maxAddLiquidityLimit
    .multipliedBy(assetReserve)
    .shiftedBy(-decimals)

  const rules = required
    .pipe(positive)
    .pipe(
      isStablepool
        ? z.string()
        : maxBalance(assetBalance?.transferable ?? "0", decimals),
    )
    .refine(
      (value) => BigNumber(value).shiftedBy(decimals).gte(minPoolLiquidity),
      {
        message: t("liquidity.add.modal.validation.minPoolLiquidity"),
      },
    )
    .refine(
      (value) => {
        if (!value) return true

        const hubIn = calculate_liquidity_hub_in(
          assetReserve,
          assetHubReserve,
          assetShares,
          scale(value, decimals).toString(),
        )

        const isWithinLimit = verify_asset_cap(
          assetHubReserve,
          assetCap,
          hubIn,
          totalHubReserve,
        )

        return isWithinLimit
      },
      {
        message: t("liquidity.add.modal.warningLimit.cap"),
        path: ["cap"],
      },
    )
    .refine(
      (value) => {
        if (!value) return true

        return circuitBreakerLimit.gte(value)
      },
      {
        message: t("liquidity.add.modal.warningLimit.circuitBreaker", {
          amount: circuitBreakerLimit,
          symbol,
        }),
        path: ["circuitBreaker"],
      },
    )

  if (!isFarms) return z.object({ amount: rules })

  if (!oraclePrice) return undefined

  return z.object({
    amount: rules.refine(
      (value) => {
        if (!value || !BigNumber(value).isPositive()) return true

        const scaledValue = scale(value, decimals)
        // position.amount * n/d (from oracle) > globalFarm.minDeposit
        const valueInIncentivizedAsset = scaledValue
          .times(oraclePrice?.price?.n ?? 1)
          .div(oraclePrice?.price?.d ?? 1)

        return valueInIncentivizedAsset.gte(minDeposit.value)
      },
      (value) => {
        const maxValue = minDeposit.value
          .times(oraclePrice?.price?.d ?? 1)
          .div(oraclePrice?.price?.n ?? 1)

        return {
          message: t("farms.modal.join.minDeposit", {
            value: scaleHuman(maxValue, decimals).times(1.02),
            symbol: symbol,
          }),
          path: ["farm"],
        }
      },
    ),
  })
}

export const useXYKZodSchema = (
  assetAMeta: TAsset,
  assetBMeta: TAsset,
  meta: TAsset,
  farms: TFarmAprData[],
) => {
  const { api } = useRpcProvider()
  const { t } = useTranslation()
  const { data: xykConsts } = useXYKConsts()
  const accountAssets = useAccountBalances()

  const assetAId = assetAMeta.id
  const assetBId = assetBMeta.id

  const estimatedFees = useEstimatedFees([
    api.tx.xyk.addLiquidity(assetAId, assetBId, "1", "1"),
  ])

  const feeWithBuffer = estimatedFees.accountCurrencyFee
    .times(1.03) // 3%
    .decimalPlaces(0)

  const assetABalances =
    accountAssets.data?.accountAssetsMap.get(assetAId)?.balance
  const assetBBalances =
    accountAssets.data?.accountAssetsMap.get(assetBId)?.balance

  const balanceA = assetABalances?.transferable ?? "0"
  const balanceB = assetBBalances?.transferable ?? "0"

  const balanceAMax =
    estimatedFees.accountCurrencyId === assetAId
      ? BN(balanceA)
          .minus(feeWithBuffer)
          .minus(assetAMeta.existentialDeposit)
          .toString()
      : balanceA

  const balanceBMax =
    estimatedFees.accountCurrencyId === assetBId
      ? BN(balanceB)
          .minus(feeWithBuffer)
          .minus(assetBMeta.existentialDeposit)
          .toString()
      : balanceB

  const minDeposit = useMemo(() => {
    return farms.reduce<{ value: BigNumber; assetId?: string }>(
      (acc, farm) => {
        const minDeposit = BN(farm.minDeposit)

        return minDeposit.gt(acc.value)
          ? {
              value: minDeposit,
              assetId: farm.incentivizedAsset,
            }
          : acc
      },
      { value: BN_0, assetId: undefined },
    )
  }, [farms])

  if (balanceA === undefined || balanceB === undefined) return {}

  const zodSchema = z
    .object({
      assetA: required
        .pipe(positive)
        .pipe(maxBalance(balanceAMax, assetAMeta.decimals)),

      assetB: required
        .pipe(positive)
        .pipe(maxBalance(balanceBMax, assetBMeta.decimals)),
      shares: z.string().refine(
        (value) => {
          if (minDeposit.value.isZero()) return true

          return BigNumber(value).gte(minDeposit.value)
        },
        () => {
          return {
            message: t("farms.modal.join.minDeposit", {
              value: scaleHuman(minDeposit.value, meta.decimals).times(1.02),
              symbol: meta.symbol,
            }),
            path: ["farm"],
          }
        },
      ),
    })
    .refine(
      ({ assetA, assetB, shares }) => {
        if (assetA.length && assetB.length && shares.length) {
          const minTradingLimit = BigNumber(xykConsts?.minTradingLimit ?? 0)
          const minPoolLiquidity = BigNumber(xykConsts?.minPoolLiquidity ?? 0)

          const minAssetATradingLimit = scale(assetA, assetAMeta.decimals).gt(
            minTradingLimit,
          )
          const minAssetBTradingLimit = scale(assetB, assetBMeta.decimals).gt(
            minTradingLimit,
          )

          const isMinPoolLiquidity = BigNumber(shares).gt(minPoolLiquidity)

          const isMinAddLiqudity =
            !minAssetATradingLimit ||
            !minAssetBTradingLimit ||
            !isMinPoolLiquidity

          return !isMinAddLiqudity
        }

        return false
      },
      () => {
        return {
          message: "minAddLiquidity",
          path: ["shares"],
        }
      },
    )

  return { zodSchema, balanceAMax, balanceBMax, balanceA, balanceB }
}

export const getXYKPoolShare = (total: BigNumber, add: BigNumber) =>
  add.div(total.plus(add)).multipliedBy(100)
