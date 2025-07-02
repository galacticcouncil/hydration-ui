import { useRpcProvider } from "providers/rpcProvider"
import { useXYKPools } from "sections/pools/PoolsPage.utils"
import { HeaderValues } from "sections/pools/header/PoolsHeader"
import { HeaderTotalData } from "sections/pools/header/PoolsHeaderTotal"
import { useTranslation } from "react-i18next"
import { BN_NAN } from "utils/constants"
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
import { useXykTvlTotal, useXykVolumeTotal } from "state/store"
import BN from "bignumber.js"

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

  const tvl = useXykTvlTotal((state) => state.tvl)
  const volume = useXykVolumeTotal((state) => state.volume)

  if (id != null) {
    const pool = xykPools.data?.find((pool) => pool.id === id.toString())

    const isLoading = xykPools.isInitialLoading

    if (!pool && isLoading) return <PoolSkeleton />

    if (pool) return <PoolWrapper pool={pool} />
  }

  const filteredPools =
    (search && xykPools.data
      ? arraySearch(xykPools.data, search, ["symbol", "name"])
      : xykPools.data) ?? []

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
                isLoading={!tvl}
                value={tvl ? BN(tvl) : BN_NAN}
                fontSize={[19, 24]}
              />
            ),
          },
          {
            withoutSeparator: true,
            label: t("liquidity.header.24hours"),
            content: (
              <HeaderTotalData
                isLoading={!volume}
                value={volume ? BN(volume) : BN_NAN}
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
