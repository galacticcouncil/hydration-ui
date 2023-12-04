import { Text } from "components/Typography/Text/Text"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { usePools, useXYKPools } from "sections/pools/PoolsPage.utils"
import { HeaderValues } from "sections/pools/header/PoolsHeader"
import { HeaderTotalData } from "sections/pools/header/PoolsHeaderTotal"
import { BN_0 } from "utils/constants"
import { SearchFilter } from "sections/pools/filter/SearchFilter"
import { useSearchFilter } from "sections/pools/filter/SearchFilter.utils"
import { arraySearch } from "utils/helpers"
import { PoolsTable } from "sections/pools/table/PoolsTable"
import { useSearch } from "@tanstack/react-location"
import { PoolWrapper } from "sections/pools/poolNew/Pool"
import { StablePoolsTotal } from "sections/pools/header/StablePoolsTotal"
import { AllPoolsVolumeTotal } from "sections/pools/header/VolumeTotal"
import { PoolsTableSkeleton } from "sections/pools/table/PoolsTableSkeleton"
import { PoolSkeleton } from "sections/pools/poolNew/PoolSkeleton"

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
              label: t("liquidity.header.24hours"),
              content: <HeaderTotalData isLoading />,
            },
          ]}
        />
        <SearchFilter />
        <div sx={{ flex: "column", gap: 20 }}>
          <Text fs={19} lh={24} font="FontOver" tTransform="uppercase">
            {t("liquidity.section.omnipoolAndStablepool")}
          </Text>
          <PoolsTableSkeleton />
        </div>
      </>
    )

  return <AllPoolsData />
}

const AllPoolsData = () => {
  const { t } = useTranslation()
  const { search } = useSearchFilter()
  const { id } = useSearch<{
    Search: {
      id?: number
    }
  }>()

  const pools = usePools()
  const xylPools = useXYKPools()

  const omnipoolTotal = useMemo(
    () =>
      pools.data
        ? pools.data.reduce((acc, asset) => acc.plus(asset.tvlDisplay), BN_0)
        : BN_0,

    [pools.data],
  )

  const xykTotal = useMemo(() => {
    if (xylPools.data) {
      return xylPools.data.reduce((acc, xykPool) => {
        return acc.plus(xykPool.tvlDisplay ?? BN_0)
      }, BN_0)
    }
    return BN_0
  }, [xylPools.data])

  const filteredPools =
    (search && pools.data
      ? arraySearch(pools.data, search, ["name", "symbol"])
      : pools.data) ?? []

  const filteredXYKPools =
    (search && xylPools.data
      ? arraySearch(xylPools.data, search, ["name", "symbol"])
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
            content: (
              <HeaderTotalData
                isLoading={pools.isLoading}
                value={omnipoolTotal}
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
                isLoading={xylPools.isInitialLoading}
                value={xykTotal}
              />
            ),
          },

          {
            withoutSeparator: true,
            label: t("liquidity.header.24hours"),
            content: <AllPoolsVolumeTotal />,
          },
        ]}
      />

      <SearchFilter />

      <div sx={{ flex: "column", gap: 20 }}>
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
      </div>
    </>
  )
}
