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
import { XYKVolumeTotal } from "sections/pools/header/VolumeTotal"
import { PoolWrapper } from "sections/pools/pool/Pool"
import { useSearch } from "@tanstack/react-location"
import { PoolsTableSkeleton } from "sections/pools/table/PoolsTableSkeleton"
import { PoolSkeleton } from "sections/pools/pool/PoolSkeleton"
import { EmptySearchState } from "sections/pools/components/EmptySearchState"

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
          values={[
            {
              label: t("liquidity.header.isolated"),
              content: <HeaderTotalData isLoading />,
            },
            {
              withoutSeparator: true,
              label: t("liquidity.header.24hours"),
              content: <HeaderTotalData isLoading />,
            },
          ]}
        />
        <SearchFilter />

        <PoolsTableSkeleton isXyk />
      </>
    )

  return <IsolatedPoolsData />
}

const IsolatedPoolsData = () => {
  const { t } = useTranslation()
  const { search } = useSearchFilter()
  const { id } = useSearch<{
    Search: {
      id?: number
    }
  }>()

  const xylPools = useXYKPools()

  const totalLocked = useMemo(() => {
    if (xylPools.data) {
      return xylPools.data.reduce((acc, xykPool) => {
        return acc.plus(xykPool.tvlDisplay ?? BN_0)
      }, BN_0)
    }
    return BN_0
  }, [xylPools.data])

  const filteredPools =
    (search && xylPools.data
      ? arraySearch(xylPools.data, search, ["symbol", "name"])
      : xylPools.data) ?? []

  if (id != null) {
    const pool = xylPools.data?.find((pool) => pool.id === id.toString())

    const isLoading = xylPools.isInitialLoading

    if (!pool && isLoading) return <PoolSkeleton />

    if (pool) return <PoolWrapper pool={pool} />
  }

  return (
    <>
      <HeaderValues
        values={[
          {
            label: t("liquidity.header.isolated"),
            content: (
              <HeaderTotalData
                isLoading={xylPools.isInitialLoading}
                value={totalLocked}
              />
            ),
          },
          {
            withoutSeparator: true,
            label: t("liquidity.header.24hours"),
            content: <XYKVolumeTotal />,
          },
        ]}
      />
      <SearchFilter />

      {xylPools.isInitialLoading ? (
        <PoolsTableSkeleton isXyk />
      ) : filteredPools.length ? (
        <PoolsTable data={filteredPools} isXyk />
      ) : (
        <EmptySearchState />
      )}
    </>
  )
}
