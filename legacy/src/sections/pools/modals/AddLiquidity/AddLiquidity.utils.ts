import {
  calculate_liquidity_hub_in,
  calculate_shares,
  verify_asset_cap,
} from "@galacticcouncil/math-omnipool"
import { useTokenBalance } from "api/balances"
import { useMaxAddLiquidityLimit } from "api/consts"
import {
  useOmnipoolFee,
  useOmnipoolMinLiquidity,
  useOmnipoolDataObserver,
  TOmnipoolAssetsData,
} from "api/omnipool"
import BigNumber from "bignumber.js"
import { useMemo } from "react"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { useDisplayPrice } from "utils/displayAsset"
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { maxBalance, positive, required } from "utils/validators"
import { scale, scaleHuman } from "utils/balance"
import { Farm, useOraclePrice } from "api/farms"
import { BN_0, BN_NAN } from "utils/constants"
import BN from "bignumber.js"
import { ApiPromise } from "@polkadot/api"
import { useXYKConsts } from "api/xyk"
import { useEstimatedFees } from "api/transaction"
import { usePoolData } from "sections/pools/pool/Pool"
import { TAsset, useAssets } from "providers/assets"
import { useAccountAssets } from "api/deposits"

export const getAddToOmnipoolFee = (api: ApiPromise, farms: Farm[]) => {
  const txs = [api.tx.omnipool.addLiquidity("0", "1")]
  const [firstFarm, ...restFarm] = farms

  if (firstFarm)
    txs.push(
      api.tx.omnipoolLiquidityMining.depositShares(
        firstFarm.globalFarm.id,
        firstFarm.yieldFarm.id,
        "0",
      ),
    )

  if (restFarm.length) {
    const restFarmTxs = restFarm.map((farm) =>
      api.tx.omnipoolLiquidityMining.redepositShares(
        farm.globalFarm.id,
        farm.yieldFarm.id,
        "0",
      ),
    )

    txs.push(
      restFarmTxs.length > 1
        ? api.tx.utility.batch(restFarmTxs)
        : restFarmTxs[0],
    )
  }

  return txs
}

const getSharesToGet = (
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

  const { data: spotPrice } = useDisplayPrice(assetId)

  const { data: omnipoolFee } = useOmnipoolFee()

  const { data: accountAssets } = useAccountAssets()
  const assetBalance = accountAssets?.accountAssetsMap.get(assetId)?.balance

  const poolShare = useMemo(() => {
    if (ommipoolAsset && assetValue) {
      const sharesToGet = getSharesToGet(
        ommipoolAsset,
        scale(assetValue, pool.meta.decimals).toString(),
      )

      const totalShares = BigNumber(ommipoolAsset.shares).plus(sharesToGet)
      const poolShare = BigNumber(sharesToGet).div(totalShares).times(100)

      return poolShare
    }
  }, [assetValue, ommipoolAsset, pool.meta.decimals])

  return {
    poolShare,
    spotPrice,
    omnipoolFee,
    assetMeta: pool.meta,
    assetBalance,
  }
}

export const useAddToOmnipoolZod = (
  assetId: string,
  farms: Farm[],
  isStablepool?: boolean,
) => {
  const { t } = useTranslation()
  const { pool } = usePoolData()
  const { hub } = useAssets()

  const { decimals, symbol } = pool.meta

  const { data: minPoolLiquidity } = useOmnipoolMinLiquidity()

  const { data: accountAssets } = useAccountAssets()
  const assetBalance = accountAssets?.accountAssetsMap.get(assetId)?.balance

  const omnipoolAssets = useOmnipoolDataObserver()
  const omnipoolAsset = omnipoolAssets.dataMap?.get(assetId)

  const { data: hubBalance } = useTokenBalance(hub.id, OMNIPOOL_ACCOUNT_ADDRESS)
  const { data: poolBalance } = useTokenBalance(
    assetId,
    OMNIPOOL_ACCOUNT_ADDRESS,
  )
  const { data: maxAddLiquidityLimit } = useMaxAddLiquidityLimit()

  const isFarms = farms.length

  const minDeposit = useMemo(() => {
    return farms.reduce<{ value: BigNumber; assetId?: string }>(
      (acc, farm) => {
        const minDeposit = farm.globalFarm.minDeposit.toBigNumber()

        return minDeposit.gt(acc.value)
          ? {
              value: minDeposit,
              assetId: farm.globalFarm.incentivizedAsset.toString(),
            }
          : acc
      },
      { value: BN_0, assetId: undefined },
    )
  }, [farms])

  const oraclePrice = useOraclePrice(
    isFarms ? minDeposit.assetId : undefined,
    assetId,
  )

  if (
    minPoolLiquidity === undefined ||
    omnipoolAsset === undefined ||
    hubBalance === undefined ||
    poolBalance === undefined ||
    maxAddLiquidityLimit === undefined
  )
    return undefined

  const assetReserve = poolBalance.balance.toString()
  const assetHubReserve = omnipoolAsset.hubReserve
  const assetShares = omnipoolAsset.shares
  const assetCap = omnipoolAsset.cap
  const totalHubReserve = hubBalance.total.toString()

  const circuitBreakerLimit = maxAddLiquidityLimit
    .multipliedBy(assetReserve)
    .shiftedBy(-decimals)

  const rules = required
    .pipe(positive)
    .pipe(
      isStablepool
        ? z.string()
        : maxBalance(assetBalance?.balance ?? BN_0, decimals),
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

  return z.object({
    amount: isFarms
      ? rules.refine(
          (value) => {
            if (!value || !BigNumber(value).isPositive()) return true
            const scaledValue = scale(value, decimals)
            // position.amount * n/d (from oracle) > globalFarm.minDeposit
            const valueInIncentivizedAsset = scaledValue
              .times(oraclePrice.data?.price?.n ?? 1)
              .div(oraclePrice.data?.price?.d ?? 1)

            if (valueInIncentivizedAsset.lt(minDeposit.value)) return false

            const sharesToGet = getSharesToGet(
              omnipoolAsset,
              scaledValue.toString(),
            )

            if (!sharesToGet.isNaN()) {
              // position.shares > globalFarm.minDeposit
              if (sharesToGet.gte(minDeposit.value)) return true
            }

            return false
          },
          (value) => {
            const scaledValue = scale(value, decimals)
            const sharesToGet = getSharesToGet(
              omnipoolAsset,
              scaledValue.toString(),
            )

            // min amount of current asset to join farms
            let minAmountToProvide = BN_0

            if (minDeposit.value.minus(sharesToGet).isPositive()) {
              const diffCof = minDeposit.value.div(sharesToGet)

              minAmountToProvide = scaledValue.times(diffCof)
            }

            const maxValue = BigNumber.max(
              minDeposit.value
                .times(oraclePrice.data?.price?.d ?? 1)
                .div(oraclePrice.data?.price?.n ?? 1),
              minAmountToProvide,
            )

            return {
              message: t("farms.modal.join.minDeposit", {
                value: scaleHuman(maxValue, decimals).times(1.02),
                symbol: symbol,
              }),
              path: ["farm"],
            }
          },
        )
      : rules,
  })
}

export const useXYKZodSchema = (
  assetAMeta: TAsset,
  assetBMeta: TAsset,
  meta: TAsset,
  farms: Farm[],
) => {
  const { api } = useRpcProvider()
  const { t } = useTranslation()
  const { data: xykConsts } = useXYKConsts()
  const accountAssets = useAccountAssets()

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

  const balanceA = assetABalances?.balance ?? BN_0
  const balanceB = assetBBalances?.balance ?? BN_0

  const balanceAMax =
    estimatedFees.accountCurrencyId === assetAId
      ? balanceA.minus(feeWithBuffer).minus(assetAMeta.existentialDeposit)
      : balanceA

  const balanceBMax =
    estimatedFees.accountCurrencyId === assetBId
      ? balanceB.minus(feeWithBuffer).minus(assetBMeta.existentialDeposit)
      : balanceB

  const minDeposit = useMemo(() => {
    return farms.reduce<{ value: BigNumber; assetId?: string }>(
      (acc, farm) => {
        const minDeposit = farm.globalFarm.minDeposit.toBigNumber()

        return minDeposit.gt(acc.value)
          ? {
              value: minDeposit,
              assetId: farm.globalFarm.incentivizedAsset.toString(),
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