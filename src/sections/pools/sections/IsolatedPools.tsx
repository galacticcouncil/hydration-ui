import { useRpcProvider } from "providers/rpcProvider"
import { useXYKPools, XYK_TVL_VISIBILITY } from "sections/pools/PoolsPage.utils"
import { HeaderValues } from "sections/pools/header/PoolsHeader"
import { HeaderTotalData } from "sections/pools/header/PoolsHeaderTotal"
import { useTranslation } from "react-i18next"
import { useMemo, useState } from "react"
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
import { EmptySearchState } from "components/EmptySearchState/EmptySearchState"
import { Spacer } from "components/Spacer/Spacer"
import { CreateXYKPoolModalButton } from "sections/pools/modals/CreateXYKPool/CreateXYKPoolModalButton"
import { Switch } from "components/Switch/Switch"

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
  const [showAllXyk, setShowAllXyk] = useState(false)
  const { search } = useSearchFilter()
  const { id } = useSearch<{
    Search: {
      id?: number
    }
  }>()

  const xykPools = useXYKPools()

  const totalLocked = useMemo(() => {
    if (xykPools.data) {
      return xykPools.data.reduce((acc, xykPool) => {
        return acc.plus(!xykPool.tvlDisplay.isNaN() ? xykPool.tvlDisplay : BN_0)
      }, BN_0)
    }
    return BN_0
  }, [xykPools.data])

  const filteredPools = useMemo(
    () =>
      (search && xykPools.data
        ? arraySearch(xykPools.data, search, ["symbol", "name"])
        : xykPools.data) ?? [],
    [search, xykPools.data],
  )

  const visiblePools = useMemo(
    () =>
      showAllXyk
        ? filteredPools
        : filteredPools.filter((pool) =>
            pool.tvlDisplay.gte(XYK_TVL_VISIBILITY),
          ),
    [filteredPools, showAllXyk],
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
                value={totalLocked}
                fontSize={[19, 24]}
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
        <Switch
          value={showAllXyk}
          onCheckedChange={(value) => setShowAllXyk(value)}
          size="small"
          name="showAll"
          label={t("liquidity.section.xyk.toggle")}
          sx={{ pb: 20 }}
        />
        <CreateXYKPoolModalButton
          sx={{ ml: "auto", width: ["100%", "auto"] }}
          disabled={xykPools.isInitialLoading}
        />
      </div>
      {xykPools.isInitialLoading ? (
        <PoolsTableSkeleton isXyk />
      ) : filteredPools.length ? (
        <PoolsTable data={visiblePools} isXyk />
      ) : (
        <EmptySearchState />
      )}
    </>
  )
}
