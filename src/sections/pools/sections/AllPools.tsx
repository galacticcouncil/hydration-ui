import { useRpcProvider } from "providers/rpcProvider"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
  calculatePoolsTotals,
  calculateXykTotals,
  usePools,
  useXYKPools,
} from "sections/pools/PoolsPage.utils"
import { HeaderValues } from "sections/pools/header/PoolsHeader"
import { HeaderTotalData } from "sections/pools/header/PoolsHeaderTotal"
import { SearchFilter } from "sections/pools/filter/SearchFilter"
import { useSearchFilter } from "sections/pools/filter/SearchFilter.utils"
import { arraySearch } from "utils/helpers"
import { PoolsTable } from "sections/pools/table/PoolsTable"
import { useSearch } from "@tanstack/react-location"
import { PoolWrapper } from "sections/pools/pool/Pool"
import { StablePoolsTotal } from "sections/pools/header/StablePoolsTotal"
import { PoolsTableSkeleton } from "sections/pools/table/PoolsTableSkeleton"
import { PoolSkeleton } from "sections/pools/pool/PoolSkeleton"
import { EmptySearchState } from "components/EmptySearchState/EmptySearchState"
import { TableLabel } from "sections/pools/components/TableLabel"
import { CreateXYKPoolModalButton } from "sections/pools/modals/CreateXYKPool/CreateXYKPoolModalButton"

export const AllPools = () => {
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
        <div sx={{ flex: "column" }}>
          <div sx={{ flex: "column" }}>
            <TableLabel label={t("liquidity.section.omnipoolAndStablepool")} />
            <PoolsTableSkeleton />
          </div>
          <div sx={{ flex: "column" }}>
            <TableLabel label={t("liquidity.section.xyk")} />
            <PoolsTableSkeleton isXyk />
          </div>
        </div>
      </>
    )

  return <AllPoolsData />
}

const AllPoolsData = () => {
  const { t } = useTranslation()
  const { search } = useSearchFilter()
  const searchQuery = useSearch<{
    Search: {
      id?: number
    }
  }>()

  const { id } = searchQuery

  const pools = usePools()
  const xykPools = useXYKPools()

  const omnipoolTotals = useMemo(
    () => calculatePoolsTotals(pools.data),
    [pools.data],
  )

  const xykTotals = useMemo(
    () => calculateXykTotals(xykPools.data),
    [xykPools.data],
  )

  const filteredPools =
    (search && pools.data
      ? arraySearch(pools.data, search, ["symbol", "name"])
      : pools.data) ?? []

  const filteredXYKPools = useMemo(
    () =>
      (search && xykPools.data
        ? arraySearch(xykPools.data, search, ["symbol", "name"])
        : xykPools.data) ?? [],
    [search, xykPools.data],
  )

  if (id != null) {
    const pool = [...(pools.data ?? []), ...(xykPools.data ?? [])].find(
      (pool) => pool.id === id.toString(),
    )
    const isLoading = pools.isLoading || xykPools.isInitialLoading

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
            label: t("liquidity.header.isolated"),
            content: (
              <HeaderTotalData
                isLoading={xykPools.isInitialLoading}
                value={xykTotals.tvl}
                fontSize={[19, 24]}
              />
            ),
          },

          {
            withoutSeparator: true,
            label: t("liquidity.header.24hours"),
            content: (
              <HeaderTotalData
                isLoading={pools.isLoading || xykPools.isInitialLoading}
                value={xykTotals.volume.plus(omnipoolTotals.volume.div(2))}
                fontSize={[19, 24]}
              />
            ),
          },
        ]}
      />

      <SearchFilter />

      {!pools.isLoading &&
        !xykPools.isInitialLoading &&
        !filteredPools.length &&
        !filteredXYKPools.length && <EmptySearchState />}

      <div sx={{ flex: "column" }}>
        {!!filteredPools.length || pools.isLoading ? (
          <div sx={{ flex: "column" }}>
            <TableLabel label={t("liquidity.section.omnipoolAndStablepool")} />
            {pools.isLoading ? (
              <PoolsTableSkeleton />
            ) : (
              <PoolsTable data={filteredPools} />
            )}
          </div>
        ) : null}

        {xykPools.isInitialLoading || !!filteredXYKPools.length ? (
          <div sx={{ flex: "column" }}>
            <div
              sx={{
                flex: ["column", "row"],
                justify: "space-between",
                align: ["flex-start", "flex-end"],
              }}
            >
              <div
                sx={{
                  flex: "row",
                  gap: [4, 40],
                  align: "baseline",
                  width: "100%",
                  justify: ["space-between", "start"],
                  flexWrap: "wrap",
                }}
                css={{ whiteSpace: "nowrap" }}
              >
                <TableLabel label={t("liquidity.section.xyk")} />
              </div>

              <CreateXYKPoolModalButton
                disabled={xykPools.isInitialLoading}
                sx={{ mb: 14, width: ["100%", "auto"] }}
              />
            </div>
            {xykPools.isInitialLoading ? (
              <PoolsTableSkeleton isXyk />
            ) : (
              <PoolsTable data={filteredXYKPools} isXyk paginated />
            )}
          </div>
        ) : null}
      </div>
    </>
  )
}
