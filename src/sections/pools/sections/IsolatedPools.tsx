import { useRpcProvider } from "providers/rpcProvider"
import { useXYKPools } from "sections/pools/PoolsPage.utils"
import { HeaderValues } from "sections/pools/header/PoolsHeader"
import { HeaderTotalData } from "sections/pools/header/PoolsHeaderTotal"
import { useTranslation } from "react-i18next"
import { useMemo } from "react"
import { BN_0 } from "utils/constants"
import { SearchFilter } from "sections/pools/filter/SearchFilter"
import { useSearchFilter } from "sections/pools/filter/SearchFilter.utils"
import { arraySearch } from "utils/helpers"
import { PoolsTable } from "sections/pools/table/PoolsTable"
import { PoolWrapper } from "sections/pools/pool/Pool"
import { useSearch } from "@tanstack/react-location"
import { PoolsTableSkeleton } from "sections/pools/table/PoolsTableSkeleton"
import { PoolSkeleton } from "sections/pools/pool/PoolSkeleton"
import { EmptySearchState } from "components/EmptySearchState/EmptySearchState"
import { Spacer } from "components/Spacer/Spacer"
import { CreateXYKPoolModalButton } from "sections/pools/modals/CreateXYKPool/CreateXYKPoolModalButton"

export const IsolatedPools = () => {
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
              label: t("liquidity.header.isolated"),
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
        <PoolsTableSkeleton isXyk />
      </>
    )

  return <IsolatedPoolsData />
}

const IsolatedPoolsData = () => {
  const { t } = useTranslation()
  const { search } = useSearchFilter()
  const searchQuery = useSearch<{
    Search: {
      id?: number
    }
  }>()
  const { id } = searchQuery

  const xykPools = useXYKPools()

  const totals = useMemo(() => {
    if (xykPools.data) {
      return xykPools.data.reduce(
        (acc, xykPool) => {
          if (!xykPool.isInvalid) {
            acc.tvl = acc.tvl.plus(
              !xykPool.tvlDisplay.isNaN() ? xykPool.tvlDisplay : BN_0,
            )
            acc.volume = acc.volume.plus(xykPool.volume ?? 0)
          }

          return acc
        },
        { tvl: BN_0, volume: BN_0 },
      )
    }

    return { tvl: BN_0, volume: BN_0 }
  }, [xykPools.data])

  const filteredPools = useMemo(
    () =>
      (search && xykPools.data
        ? arraySearch(xykPools.data, search, ["symbol", "name"])
        : xykPools.data) ?? [],
    [search, xykPools.data],
  )

  if (id != null) {
    const pool = xykPools.data?.find((pool) => pool.id === id.toString())

    const isLoading = xykPools.isInitialLoading

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
            label: t("liquidity.header.isolated"),
            content: (
              <HeaderTotalData
                isLoading={xykPools.isInitialLoading}
                value={totals.tvl}
                fontSize={[19, 24]}
              />
            ),
          },
          {
            withoutSeparator: true,
            label: t("liquidity.header.24hours"),
            content: (
              <HeaderTotalData
                isLoading={xykPools.isInitialLoading}
                value={totals.volume}
                fontSize={[19, 24]}
              />
            ),
          },
        ]}
      />
      <SearchFilter />
      <Spacer size={24} />
      <div
        sx={{
          flex: "row",
          mb: 14,
          gap: 4,
          align: "baseline",
          flexWrap: "wrap",
        }}
      >
        <CreateXYKPoolModalButton
          sx={{ ml: "auto", width: ["100%", "auto"] }}
          disabled={xykPools.isInitialLoading}
        />
      </div>
      {xykPools.isInitialLoading ? (
        <PoolsTableSkeleton isXyk />
      ) : filteredPools.length ? (
        <PoolsTable data={filteredPools} isXyk paginated />
      ) : (
        <EmptySearchState />
      )}
    </>
  )
}
