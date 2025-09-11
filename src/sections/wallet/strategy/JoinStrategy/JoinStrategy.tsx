import { Text } from "components/Typography/Text/Text"
import { Separator } from "components/Separator/Separator"
import { THollarPool } from "sections/wallet/strategy/StrategyTile/HollarTile"
import { useAssets } from "providers/assets"
import { useMemo } from "react"
import BN from "bignumber.js"
import { useTranslation } from "react-i18next"
import { MultipleAssetLogo } from "components/AssetIcon/AssetIcon"
import { useAssetsPrice } from "state/displayPrice"
import { BN_0 } from "utils/constants"
import { JoinStrategyButton } from "./JoinStrategyButton"
import ArrowIcon from "assets/icons/ArrowRightIconThin.svg?react"
import { Icon } from "components/Icon/Icon"

export const JoinStrategy = ({ pools }: { pools: THollarPool[] }) => {
  const { t } = useTranslation()
  const isBalances = pools.some((pool) => !!pool.reserveBalances.length)

  return (
    <div sx={{ flex: "column", gap: 8, justify: "center" }}>
      <Text fs={18} font="GeistMono">
        {t("wallet.strategy.hollar.stategy.label")}
      </Text>
      <Text fs={14} color="basic300">
        {t("wallet.strategy.hollar.stategy.desc")}
      </Text>
      <Separator color="white" sx={{ opacity: 0.06 }} />

      {isBalances ? (
        <StratefyTitleWithBalance pools={pools} />
      ) : (
        <StrategyTitle pools={pools} />
      )}
    </div>
  )
}

const StrategyTitle = ({ pools }: { pools: THollarPool[] }) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()
  const sortedPools = pools.sort((a, b) => b.apy - a.apy)
  const highestApyPool = sortedPools.slice(0, 2)

  return (
    <>
      {highestApyPool.map((pool) => (
        <div
          key={pool.stablepoolId}
          sx={{ flex: "row", gap: 8, align: "center", py: 1 }}
        >
          <MultipleAssetLogo
            size={12}
            iconId={getAssetWithFallback(pool.stablepoolId).iconId}
          />
          <Text fs={14} font="GeistMono">
            {pool.meta.symbol}
          </Text>
          <Text fs={14} color="brightBlue100">
            {t("value.APR", { apr: pool.apy })}
          </Text>
        </div>
      ))}

      <JoinStrategyButton pools={sortedPools} />
    </>
  )
}

const StratefyTitleWithBalance = ({ pools }: { pools: THollarPool[] }) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()
  const ids = pools.flatMap((pool) =>
    pool.reserveBalances.map((balance) => balance.id),
  )
  const { getAssetPrice } = useAssetsPrice(ids)

  const { sortedPools, visiblePools } = useMemo(() => {
    const sortedPools = pools
      .map((pool) => {
        const highestBalance = pool.reserveBalances
          .map((reserveBalance) => ({
            ...reserveBalance,
            displayBalance: BN(reserveBalance.balance).times(
              getAssetPrice(reserveBalance.id).price,
            ),
          }))
          .sort((a, b) => (a.displayBalance.gt(b.displayBalance) ? -1 : 1))[0]

        return {
          ...pool,
          highestBalance,
        }
      })
      .sort((a, b) => {
        const balanceA = a.highestBalance?.displayBalance ?? BN_0
        const balanceB = b.highestBalance?.displayBalance ?? BN_0

        if (balanceA.isZero() && balanceB.isZero()) {
          return b.apy - a.apy
        }

        return balanceA.gt(balanceB) ? -1 : 1
      })

    const visiblePools = sortedPools
      .filter((pool) => !!pool.highestBalance)
      .slice(0, 2)

    return {
      sortedPools,
      visiblePools,
    }
  }, [getAssetPrice, pools])

  return (
    <>
      <Text fs={14}>{t("wallet.strategy.hollar.stategy.userAssets")}</Text>

      {visiblePools.map((pool) => {
        const meta = getAssetWithFallback(pool.highestBalance.id)

        return (
          <div
            key={pool.stablepoolId}
            sx={{ flex: "row", gap: 8, align: "center", py: 1 }}
          >
            <Text fs={14} color="brightBlue100">
              {t("value.token", { value: BN(pool.highestBalance.balance) })}
            </Text>
            <div sx={{ flex: "row", gap: 4, align: "center" }}>
              <MultipleAssetLogo size={12} iconId={meta.iconId} />
              <Text fs={14} font="GeistMono">
                {meta.symbol}
              </Text>
            </div>

            <Icon icon={<ArrowIcon />} sx={{ color: "basic500" }} />

            <div sx={{ flex: "row", gap: 4, align: "center" }}>
              <MultipleAssetLogo size={12} iconId={pool.meta.iconId} />
              <Text fs={14} font="GeistMono">
                {pool.meta.symbol}
              </Text>
            </div>
            <Text fs={14} color="brightBlue100">
              {t("value.APR", { apr: pool.apy })}
            </Text>
          </div>
        )
      })}

      <JoinStrategyButton pools={sortedPools} />
    </>
  )
}
