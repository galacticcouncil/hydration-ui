import { useRpcProvider } from "providers/rpcProvider"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { usePools } from "sections/pools/PoolsPage.utils"
import { HeaderValues } from "sections/pools/header/PoolsHeader"
import { HeaderTotalData } from "sections/pools/header/PoolsHeaderTotal"
import { BN_0 } from "utils/constants"
import { SearchFilter } from "sections/pools/filter/SearchFilter"
import { useSearchFilter } from "sections/pools/filter/SearchFilter.utils"
import { arraySearch } from "utils/helpers"
import { PoolsTable } from "sections/pools/table/PoolsTable"
import { StablePoolsTotal } from "sections/pools/header/StablePoolsTotal"
import { useSearch } from "@tanstack/react-location"
import { PoolWrapper } from "sections/pools/pool/Pool"
import { PoolsTableSkeleton } from "sections/pools/table/PoolsTableSkeleton"
import { PoolSkeleton } from "sections/pools/pool/PoolSkeleton"
import { EmptySearchState } from "components/EmptySearchState/EmptySearchState"
import { Spacer } from "components/Spacer/Spacer"

export const OmnipoolAndStablepool = () => {
  const { t } = useTranslation()
  const { isLoaded } = useRpcProvider()
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
          fontSizeLabel={14}
          skeletonHeight={[19, 24]}
          values={[
            {
              label: t("liquidity.header.omnipool"),
              content: <HeaderTotalData isLoading fontSize={[19, 24]} />,
            },
            {
              label: t("liquidity.header.stablepool"),
              content: <HeaderTotalData isLoading fontSize={[19, 24]} />,
            },
            {
              withoutSeparator: true,
              label: t("liquidity.header.24hours"),
              content: <HeaderTotalData isLoading fontSize={[19, 24]} />,
            },
          ]}
        />
        <SearchFilter />
        <Spacer size={[24, 40]} />
        <PoolsTableSkeleton />
      </>
    )

  return <OmnipoolAndStablepoolData />
}

const OmnipoolAndStablepoolData = () => {
  const { t } = useTranslation()
  const { search } = useSearchFilter()
  const searchQuery = useSearch<{
    Search: {
      id?: number
    }
  }>()
  const { id } = searchQuery

  const pools = usePools()

  const omnipoolTotals = useMemo(() => {
    if (!pools.data) return { tvl: BN_0, volume: BN_0 }
    return pools.data.reduce(
      (acc, pool) => {
        acc.tvl = acc.tvl.plus(
          !pool.tvlDisplay.isNaN() ? pool.tvlDisplay : BN_0,
        )
        acc.volume = acc.volume.plus(pool.volume ?? 0)

        return acc
      },

      { tvl: BN_0, volume: BN_0 },
    )
  }, [pools.data])

  const filteredPools =
    (search && pools.data
      ? arraySearch(pools.data, search, ["symbol", "name"])
      : pools.data) ?? []

  if (id != null) {
    const pool = pools.data?.find((pool) => pool.id === id.toString())

    const isLoading = pools.isLoading

    if (!pool && isLoading) return <PoolSkeleton />

    if (pool) return <PoolWrapper pool={pool} />
  }

  return (
    <>
      <HeaderValues
        fontSizeLabel={14}
        skeletonHeight={[19, 24]}
        values={[
          {
            label: t("liquidity.header.omnipool"),
            content: (
              <HeaderTotalData
                isLoading={pools.isLoading}
                value={omnipoolTotals.tvl}
                fontSize={[19, 24]}
              />
            ),
          },
          {
            label: t("liquidity.header.stablepool"),
            content: <StablePoolsTotal />,
          },
          {
            withoutSeparator: true,
            label: t("liquidity.header.24hours"),
            content: (
              <HeaderTotalData
                isLoading={pools.isLoading}
                value={omnipoolTotals.volume.div(2)}
                fontSize={[19, 24]}
              />
            ),
          },
        ]}
      />
      <SearchFilter />
      <Spacer size={[24, 40]} />
      {pools.isLoading ? (
        <PoolsTableSkeleton />
      ) : filteredPools.length ? (
        <PoolsTable data={filteredPools} />
      ) : (
        <EmptySearchState />
      )}
    </>
  )
}
