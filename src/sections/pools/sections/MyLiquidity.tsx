import { useRpcProvider } from "providers/rpcProvider"
import { useMyPools, useXYKPools } from "sections/pools/PoolsPage.utils"
import { HeaderTotalData } from "sections/pools/header/PoolsHeaderTotal"
import { HeaderValues } from "sections/pools/header/PoolsHeader"
import { useTranslation } from "react-i18next"
import { useMemo } from "react"
import { BN_0 } from "utils/constants"
import { ClaimAllDropdown } from "sections/pools/farms/components/claimAllDropdown/ClaimAllDropdown"
import { Text } from "components/Typography/Text/Text"
import { SearchFilter } from "sections/pools/filter/SearchFilter"
import { useSearchFilter } from "sections/pools/filter/SearchFilter.utils"
import { arraySearch } from "utils/helpers"
import { PoolsTable } from "sections/pools/table/PoolsTable"
import { PoolWrapper } from "sections/pools/pool/Pool"
import { useSearch } from "@tanstack/react-location"
import { MyOmnipoolTotal } from "sections/pools/header/MyOmnipoolTotal"
import { MyFarmsTotal } from "sections/pools/header/MyFarmsTotal"
import { MyStablePoolsTotal } from "sections/pools/header/StablePoolsTotal"
import { PoolsTableSkeleton } from "sections/pools/table/PoolsTableSkeleton"
import { PoolSkeleton } from "sections/pools/pool/PoolSkeleton"
import { EmptySearchState } from "components/EmptySearchState/EmptySearchState"

const poolsWithMyPositions = true

export const MyLiquidity = () => {
  const { isLoaded } = useRpcProvider()
  const { t } = useTranslation()

  const { id } = useSearch<{
    Search: {
      id?: number
    }
  }>()

  if (!isLoaded)
    return id != null ? (
      <PoolSkeleton />
    ) : (
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

            {
              label: t("liquidity.header.isolated"),
              content: <HeaderTotalData isLoading />,
            },
            {
              withoutSeparator: true,
              label: t("liquidity.header.totalInFarms"),
              content: <HeaderTotalData isLoading />,
            },
          ]}
        />
        <SearchFilter />

        <div sx={{ flex: "column", gap: 20 }}>
          <div sx={{ flex: "column", gap: 20 }}>
            <Text fs={19} lh={24} font="FontOver" tTransform="uppercase">
              {t("liquidity.section.omnipoolAndStablepool")}
            </Text>
            <PoolsTableSkeleton />
          </div>
          <div sx={{ flex: "column", gap: 20 }}>
            <Text fs={19} lh={24} font="FontOver" tTransform="uppercase">
              {t("liquidity.section.xyk")}
            </Text>
            <PoolsTableSkeleton isXyk />
          </div>
        </div>
      </>
    )

  return <MyLiquidityData />
}

const MyLiquidityData = () => {
  const { t } = useTranslation()
  const { search } = useSearchFilter()
  const { id } = useSearch<{
    Search: {
      id?: number
    }
  }>()

  const pools = useMyPools()
  const xylPools = useXYKPools(poolsWithMyPositions)

  const xykTotal = useMemo(() => {
    if (xylPools.data) {
      return xylPools.data.reduce((acc, xykPool) => {
        const myTotalDisplay = xykPool.tvlDisplay
          ?.div(100)
          .times(xykPool.shareTokenIssuance?.myPoolShare ?? 1)

        return acc.plus(myTotalDisplay ?? BN_0)
      }, BN_0)
    }
    return BN_0
  }, [xylPools.data])

  const filteredPools =
    (search && pools.data
      ? arraySearch(pools.data, search, ["symbol", "name"])
      : pools.data) ?? []

  const filteredXYKPools =
    (search && xylPools.data
      ? arraySearch(xylPools.data, search, ["symbol", "name"])
      : xylPools.data) ?? []

  if (id != null) {
    const pool = [...(pools.data ?? []), ...(xylPools.data ?? [])].find(
      (pool) => pool.id === id.toString(),
    )

    const isLoading = pools.isLoading || xylPools.isInitialLoading

    if (!pool && isLoading) return <PoolSkeleton />

    if (pool) return <PoolWrapper pool={pool} />
  }

  return (
    <>
      <HeaderValues
        values={[
          {
            label: t("liquidity.header.omnipool"),
            content: <MyOmnipoolTotal />,
          },
          {
            label: t("liquidity.header.stablepool"),
            content: <MyStablePoolsTotal />,
          },
          {
            label: t("liquidity.header.isolated"),
            content: (
              <HeaderTotalData
                isLoading={xylPools.isInitialLoading}
                value={xykTotal}
              />
            ),
          },
          {
            label: t("liquidity.header.totalInFarms"),
            withoutSeparator: true,
            content: <MyFarmsTotal />,
          },
          {
            initiallyHidden: true,
            content: <ClaimAllDropdown />,
          },
        ]}
      />
      <SearchFilter />

      {!pools.isLoading &&
        !xylPools.isInitialLoading &&
        !filteredPools.length &&
        !filteredXYKPools.length && <EmptySearchState />}

      <div sx={{ flex: "column", gap: 20 }}>
        {pools.isLoading || !!filteredPools.length ? (
          <div sx={{ flex: "column", gap: 20 }}>
            <Text fs={19} lh={24} font="FontOver" tTransform="uppercase">
              {t("liquidity.section.omnipoolAndStablepool")}
            </Text>

            {pools.isLoading ? (
              <PoolsTableSkeleton />
            ) : (
              <PoolsTable data={filteredPools} />
            )}
          </div>
        ) : null}

        {xylPools.isInitialLoading || !!filteredXYKPools.length ? (
          <div sx={{ flex: "column", gap: 20 }}>
            <Text fs={19} lh={24} font="FontOver" tTransform="uppercase">
              {t("liquidity.section.xyk")}
            </Text>

            {xylPools.isInitialLoading ? (
              <PoolsTableSkeleton isXyk />
            ) : (
              <PoolsTable data={filteredXYKPools} isXyk />
            )}
          </div>
        ) : null}
      </div>
    </>
  )
}
