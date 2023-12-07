import { useRpcProvider } from "providers/rpcProvider"
import {
  isXYKEnabled,
  useOmnipoolAndStablepool,
  useXYKPools,
} from "sections/pools/PoolsPage.utils"
import { HeaderTotalData } from "sections/pools/header/PoolsHeaderTotal"
import { HeaderValues } from "sections/pools/header/PoolsHeader"
import { useTranslation } from "react-i18next"
import { PoolSkeleton } from "sections/pools/skeleton/PoolSkeleton"
import { Pool } from "sections/pools/pool/Pool"
import { useMemo } from "react"
import { BN_0 } from "utils/constants"
import { useAllUserDepositShare } from "sections/pools/farms/position/FarmingPosition.utils"
import { ClaimAllDropdown } from "sections/pools/farms/components/claimAllDropdown/ClaimAllDropdown"
import { Text } from "components/Typography/Text/Text"
import { XYKPool } from "sections/pools/pool/xyk/XYKPool"
import { SearchFilter } from "sections/pools/filter/SearchFilter"
import { useSearchFilter } from "sections/pools/filter/SearchFilter.utils"
import { arraySearch } from "utils/helpers"

const poolsWithMyPositions = true

const XYKPoolHeaderValue = () => {
  const xylPools = useXYKPools(poolsWithMyPositions)

  const totalLocked = useMemo(() => {
    if (xylPools.data) {
      return xylPools.data.reduce((acc, xykPool) => {
        const myTotalDisplay = xykPool.totalDisplay
          ?.div(100)
          .times(xykPool.shareTokenIssuance?.myPoolShare ?? 1)

        return acc.plus(myTotalDisplay ?? BN_0)
      }, BN_0)
    }
    return BN_0
  }, [xylPools.data])

  return <HeaderTotalData isLoading={xylPools.isLoading} value={totalLocked} />
}

const XYKPoolsSection = () => {
  const { t } = useTranslation()
  const { search } = useSearchFilter()
  const xylPools = useXYKPools(poolsWithMyPositions)

  if (!xylPools.data) return null

  const filteredPools =
    search && xylPools.data
      ? arraySearch(xylPools.data, search, ["symbol", "name"])
      : xylPools.data

  return (
    <div sx={{ flex: "column", gap: 20 }}>
      <Text fs={19} lh={24} font="FontOver" tTransform="uppercase">
        {t("liquidity.section.xyk")}
      </Text>
      {filteredPools.map((pool) => (
        <XYKPool key={pool.id} pool={pool} />
      ))}
    </div>
  )
}

export const MyLiquidity = () => {
  const { isLoaded } = useRpcProvider()
  const { t } = useTranslation()

  if (!isLoaded)
    return (
      <>
        <HeaderValues
          values={[
            {
              label: t("liquidity.header.omnipool"),
              content: <HeaderTotalData isLoading />,
            },
            {
              label: t("liquidity.header.stablepool"),
              content: <HeaderTotalData isLoading />,
            },
            ...(isXYKEnabled
              ? [
                  {
                    label: t("liquidity.header.isolated"),
                    content: <HeaderTotalData isLoading />,
                  },
                ]
              : []),
            {
              withoutSeparator: true,
              label: t("liquidity.header.totalInFarms"),
              content: <HeaderTotalData isLoading />,
            },
          ]}
        />
        <div sx={{ flex: "column", gap: 20 }}>
          {[...Array(3)].map((_, index) => (
            <PoolSkeleton key={index} length={3} index={index} />
          ))}
        </div>
      </>
    )

  return <MyLiquidityData />
}

const MyLiquidityData = () => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const { search } = useSearchFilter()
  const omnipoolAndStablepool = useOmnipoolAndStablepool(poolsWithMyPositions)

  const miningPositions = useAllUserDepositShare()

  const totalOmnipool = useMemo(() => {
    if (omnipoolAndStablepool.data) {
      return omnipoolAndStablepool.data
        .map((pool) =>
          pool.omnipoolNftPositions.reduce((acc, position) => {
            return acc.plus(position.valueDisplay)
          }, BN_0),
        )
        .reduce((acc, poolTotal) => {
          return acc.plus(poolTotal)
        }, BN_0)
    }
    return BN_0
  }, [omnipoolAndStablepool.data])

  const totalStablepool = useMemo(() => {
    if (omnipoolAndStablepool.data) {
      return omnipoolAndStablepool.data.reduce((acc, position) => {
        if (position.stablepoolUserPosition) {
          const meta = assets.getAsset(position.id)
          const providedAmountPrice = position.spotPrice
            ? position.stablepoolUserPosition
                .multipliedBy(position.spotPrice)
                .shiftedBy(-meta.decimals)
            : BN_0
          return acc.plus(providedAmountPrice)
        }
        return acc
      }, BN_0)
    }
    return BN_0
  }, [assets, omnipoolAndStablepool.data])

  const totalFarms = useMemo(() => {
    let calculatedShares = BN_0
    for (const poolId in miningPositions.data) {
      const poolTotal = miningPositions.data[poolId].reduce((memo, share) => {
        return memo.plus(share.valueDisplay)
      }, BN_0)
      calculatedShares = calculatedShares.plus(poolTotal)
    }
    return calculatedShares
  }, [miningPositions.data])

  const filteredPools =
    search && omnipoolAndStablepool.data
      ? arraySearch(omnipoolAndStablepool.data, search, ["symbol", "name"])
      : omnipoolAndStablepool.data

  return (
    <>
      <HeaderValues
        values={[
          {
            label: t("liquidity.header.omnipool"),
            content: (
              <HeaderTotalData
                isLoading={omnipoolAndStablepool.isLoading}
                value={totalOmnipool}
              />
            ),
          },
          {
            label: t("liquidity.header.stablepool"),
            content: (
              <HeaderTotalData
                isLoading={omnipoolAndStablepool.isLoading}
                value={totalStablepool}
              />
            ),
          },
          ...(isXYKEnabled
            ? [
                {
                  label: t("liquidity.header.isolated"),
                  content: <XYKPoolHeaderValue />,
                },
              ]
            : []),

          {
            label: t("liquidity.header.totalInFarms"),
            withoutSeparator: true,
            content: (
              <HeaderTotalData
                isLoading={miningPositions.isLoading}
                value={totalFarms}
              />
            ),
          },
          {
            initiallyHidden: true,
            content: <ClaimAllDropdown />,
          },
        ]}
      />
      <SearchFilter />
      <div sx={{ flex: "column", gap: 20 }}>
        <div sx={{ flex: "column", gap: 20 }}>
          <Text fs={19} lh={24} font="FontOver" tTransform="uppercase">
            {t("liquidity.section.omnipoolAndStablepool")}
          </Text>
          {omnipoolAndStablepool.isLoading
            ? [...Array(3)].map((_, index) => (
                <PoolSkeleton key={index} length={3} index={index} />
              ))
            : filteredPools?.map((pool) => <Pool key={pool.id} pool={pool} />)}
        </div>
        {isXYKEnabled && <XYKPoolsSection />}
      </div>
    </>
  )
}
