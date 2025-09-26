import {
  calculate_liquidity_hub_in,
  calculate_shares,
  verify_asset_cap,
} from "@galacticcouncil/math-omnipool"
import { calculate_liquidity_out_asset_a } from "@galacticcouncil/math-xyk"
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
import { z, ZodTypeAny } from "zod"
import { maxBalance, positive, required } from "utils/validators"
import { scale, scaleHuman } from "utils/balance"
import { TFarmAprData, useOraclePrice } from "api/farms"
import { BN_0, BN_100, BN_NAN, GETH_ERC20_ASSET_ID } from "utils/constants"
import BN from "bignumber.js"
import { ApiPromise } from "@polkadot/api"
import { useXYKConsts, useXYKSDKPools } from "api/xyk"
import { useEstimatedFees } from "api/transaction"
import { TAsset } from "providers/assets"
import { useAccountBalances } from "api/deposits"
import { useAssets } from "providers/assets"

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
        "1",
      )
    : api.tx.omnipool.addLiquidity("0", "1")

  return tx
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
  const { getAssetWithFallback } = useAssets()

  const meta = getAssetWithFallback(assetId)
  const ommipoolAsset = omnipoolAssets.dataMap?.get(assetId)
  const { data: omnipoolFee } = useOmnipoolFee()

  const { data: accountAssets } = useAccountBalances()
  const assetBalance = accountAssets?.accountAssetsMap.get(assetId)?.balance

  const { poolShare, sharesToGet, totalShares } = useMemo(() => {
    if (ommipoolAsset && assetValue) {
      const sharesToGet = getSharesToGet(
        ommipoolAsset,
        scale(assetValue, meta.decimals).toString(),
      )

      const totalShares = BigNumber(ommipoolAsset.shares).plus(sharesToGet)
      const poolShare = BigNumber(sharesToGet).div(totalShares).times(100)

      return { poolShare, sharesToGet, totalShares: ommipoolAsset.shares }
    }

    return { poolShare: BN_0, sharesToGet: BN_0, totalShares: BN_0 }
  }, [assetValue, ommipoolAsset, meta.decimals])

  return {
    totalShares,
    poolShare,
    sharesToGet,
    omnipoolFee,
    assetMeta: meta,
    assetBalance,
    ommipoolAsset,
    isGETH: meta.id === GETH_ERC20_ASSET_ID,
  }
}

export const useAddToOmnipoolZod = (
  asset: TAsset,
  farms: TFarmAprData[],
  stablepoolRules?: ZodTypeAny,
) => {
  const { t } = useTranslation()
  const { id: assetId, symbol, decimals } = asset

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
      !!stablepoolRules
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
        path: [0],
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
        path: [1],
      },
    )

  if (!isFarms)
    return z.object({
      amount: rules,
      ...(stablepoolRules
        ? { reserves: stablepoolRules, stablepoolShares: z.string() }
        : {}),
    })

  if (!oraclePrice) return undefined

  return z
    .object({
      amount: rules,
      farms: z.boolean(),
      ...(stablepoolRules
        ? { reserves: stablepoolRules, stablepoolShares: z.string() }
        : {}),
    })
    .superRefine((data, ctx) => {
      const { amount } = data

      const scaledAmount = scale(amount, decimals)

      const valueInIncentivizedAsset = scaledAmount
        .times(oraclePrice?.price?.n ?? 1)
        .div(oraclePrice?.price?.d ?? 1)

      if (valueInIncentivizedAsset.lt(minDeposit.value)) {
        const maxValue = minDeposit.value
          .times(oraclePrice?.price?.d ?? 1)
          .div(oraclePrice?.price?.n ?? 1)

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("farms.modal.join.minDeposit", {
            value: scaleHuman(maxValue, decimals).times(1.02),
            symbol: symbol,
          }),
          path: ["farms"],
        })
      }
    })
}

export const useXYKZodSchema = (
  assetAMeta: TAsset,
  assetBMeta: TAsset,
  meta: TAsset,
  farms: TFarmAprData[],
  poolAddress: string,
) => {
  const { api } = useRpcProvider()
  const { t } = useTranslation()
  const { data: xykConsts } = useXYKConsts()
  const accountAssets = useAccountBalances()

  const assetAId = assetAMeta.id
  const assetBId = assetBMeta.id

  const estimatedFees = useEstimatedFees(
    api.tx.xyk.addLiquidity(assetAId, assetBId, "1", "1"),
  )

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

  const requiredMinShares = useXYKPoolJoinFarmMinShares(
    poolAddress,
    minDeposit.value,
  )

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
          if (requiredMinShares.isLessThanOrEqualTo(0)) return true

          return BigNumber(value).gte(requiredMinShares)
        },
        () => {
          return {
            message: t("farms.modal.join.minDeposit", {
              value: scaleHuman(requiredMinShares, meta.decimals),
              symbol: meta.symbol,
            }),
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

const LIQUIDITY_OUT_SHARES = "10000"

export const useXYKPoolJoinFarmMinShares = (
  poolAddress: string,
  minDeposit: BN,
): BigNumber => {
  const { data: xykPools } = useXYKSDKPools()

  const [assetAReserve, assetBReserve] =
    xykPools?.find((xykPool) => xykPool.address === poolAddress)?.tokens ?? []

  const { data: oracle } = useOraclePrice(
    assetAReserve?.id,
    assetBReserve?.id,
    "hydraxyk",
  )

  return useMemo(() => {
    if (
      !oracle ||
      !oracle.liquidity ||
      !oracle.sharesIssuance ||
      !assetAReserve?.decimals
    ) {
      return BN_0
    }

    const sharesNew = calculate_liquidity_out_asset_a(
      oracle.liquidity.a,
      oracle.liquidity.b,
      LIQUIDITY_OUT_SHARES,
      oracle.sharesIssuance,
    )

    const valuedSharePrice = BN(sharesNew).div(LIQUIDITY_OUT_SHARES).toString()

    return (
      BN(minDeposit)
        .div(valuedSharePrice)
        .shiftedBy(-assetAReserve.decimals)
        // asset amount must have at maximum 1 decimal place
        .dp(1, BN.ROUND_UP)
        .shiftedBy(assetAReserve.decimals)
    )
  }, [minDeposit, oracle, assetAReserve?.decimals])
}

export const calculateLimitShares = (sharesToGet: string, limit: string) => {
  return BigNumber(sharesToGet)
    .times(BN_100.minus(limit).div(BN_100))
    .toFixed(0)
}
