import { Text } from "components/Typography/Text/Text"
import { Separator } from "components/Separator/Separator"
import { THollarPool } from "sections/wallet/strategy/StrategyTile/HollarTile"
import { useAssets } from "providers/assets"
import { useMemo } from "react"
import BN from "bignumber.js"
import { Trans, useTranslation } from "react-i18next"
import { MultipleAssetLogo } from "components/AssetIcon/AssetIcon"
import React from "react"
import { useAssetsPrice } from "state/displayPrice"
import { BN_0 } from "utils/constants"
import { JoinStrategyButton } from "./JoinStrategyButton"

export const JoinStrategy = ({ pools }: { pools: THollarPool[] }) => {
  const isBalances = pools.some((pool) => !!pool.reserveBalances.length)

  return (
    <div sx={{ flex: "column", gap: 8, justify: "center" }}>
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
  const highestApyPool = sortedPools[0]

  return (
    <>
      <p>
        <Trans t={t} i18nKey="wallet.strategy.hollar.balance.empty.label">
          <Text as="span" fs={14} />
          <Text as="span" color="brightBlue100" font="GeistMedium" fs={14} />
        </Trans>
      </p>

      <Separator color="white" sx={{ opacity: 0.06 }} />

      {highestApyPool && (
        <div sx={{ flex: "row", gap: 8, align: "center", py: 1 }}>
          <MultipleAssetLogo
            size={12}
            iconId={getAssetWithFallback(highestApyPool.stablepoolId).iconId}
          />
          <Text fs={14} font="GeistMono">
            {highestApyPool.meta.symbol}
          </Text>
          <Text fs={14} color="brightBlue100">
            {t("value.APR", { apr: highestApyPool.apy })}
          </Text>
        </div>
      )}

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
      <Text fs={14} lh="140%">
        <Trans
          i18nKey="wallet.strategy.hollar.balance.label"
          components={{
            tokens: (
              <>
                {visiblePools.map((pool, index) => {
                  const meta = getAssetWithFallback(pool.highestBalance.id)

                  return (
                    <React.Fragment key={meta.symbol}>
                      <Text
                        as="span"
                        fs={14}
                        color="brightBlue100"
                        font="GeistMedium"
                      >
                        {t("value.tokenWithSymbol", {
                          value: pool.highestBalance.balance,
                          symbol: meta.symbol,
                        })}
                      </Text>
                      {index < visiblePools.length - 1 && " & "}
                    </React.Fragment>
                  )
                })}
              </>
            ),
          }}
        />
      </Text>

      <Separator color="white" sx={{ opacity: 0.06 }} />

      {visiblePools.map((pool) => {
        return (
          <div
            key={pool.stablepoolId}
            sx={{ flex: "row", gap: 8, align: "center", py: 1 }}
          >
            <MultipleAssetLogo size={12} iconId={pool.meta.iconId} />
            <Text fs={14} font="GeistMono">
              {pool.meta.symbol}
            </Text>
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
