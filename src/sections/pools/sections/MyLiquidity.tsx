import { useRpcProvider } from "providers/rpcProvider"
import { usePools, useXYKPools } from "sections/pools/PoolsPage.utils"
import { HeaderTotalData } from "sections/pools/header/PoolsHeaderTotal"
import { HeaderValues } from "sections/pools/header/PoolsHeader"
import { useTranslation } from "react-i18next"
import { useMemo } from "react"
import { BN_0 } from "utils/constants"
import { ClaimAllDropdown } from "sections/pools/farms/components/claimAllDropdown/ClaimAllDropdown"
import { SearchFilter } from "sections/pools/filter/SearchFilter"
import { useSearchFilter } from "sections/pools/filter/SearchFilter.utils"
import { arraySearch } from "utils/helpers"
import { PoolsTable } from "sections/pools/table/PoolsTable"
import { PoolWrapper } from "sections/pools/pool/Pool"
import { Navigate, useNavigate, useSearch } from "@tanstack/react-location"
import { MyOmnipoolTotal } from "sections/pools/header/MyOmnipoolTotal"
import { PoolsTableSkeleton } from "sections/pools/table/PoolsTableSkeleton"
import { PoolSkeleton } from "sections/pools/pool/PoolSkeleton"
import { EmptySearchState } from "components/EmptySearchState/EmptySearchState"
import { MyLiquidityTotal } from "sections/pools/header/MyLiquidityTotal"
import { TableLabel } from "sections/pools/components/TableLabel"
import { LINKS } from "utils/navigation"
import { CreateXYKPoolModalButton } from "sections/pools/modals/CreateXYKPool/CreateXYKPoolModalButton"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

export const MyLiquidity = () => {
  const { account } = useAccount()
  const { isLoaded } = useRpcProvider()
  const { t } = useTranslation()

  const { id } = useSearch<{
    Search: {
      id?: number
    }
  }>()

  if (!account?.address) {
    return <Navigate to={LINKS.allPools} />
  }

  if (!isLoaded)
    return id != null ? (
      <PoolSkeleton />
    ) : (
      <>
        <HeaderValues
          fontSizeLabel={14}
          skeletonHeight={19}
          values={[
            {
              label: t("liquidity.header.myTotal"),
              content: <HeaderTotalData isLoading fontSize={19} />,
            },
            {
              label: t("liquidity.header.omnipool"),
              content: <HeaderTotalData isLoading fontSize={19} />,
            },

            {
              label: t("liquidity.header.stablepool"),
              content: <HeaderTotalData isLoading fontSize={19} />,
            },
            {
              withoutSeparator: true,
              label: t("liquidity.header.isolated"),
              content: <HeaderTotalData isLoading fontSize={19} />,
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

  return <MyLiquidityData />
}

const MyLiquidityData = () => {
  const { t } = useTranslation()
  const { search } = useSearchFilter()
  const navigate = useNavigate()
  const searchQuery = useSearch<{
    Search: {
      id?: number
    }
  }>()
  const { id } = searchQuery

  const pools = usePools()
  const xykPools = useXYKPools()

  const xykTotal = useMemo(() => {
    if (xykPools.data) {
      return xykPools.data.reduce((acc, xykPool) => {
        if (xykPool.isPositions) {
          const myTotalDisplay = xykPool.tvlDisplay
            ?.div(100)
            .times(xykPool.shareTokenIssuance?.myPoolShare ?? 1)

          return acc.plus(!myTotalDisplay.isNaN() ? myTotalDisplay : BN_0)
        }

        return acc
      }, BN_0)
    }
    return BN_0
  }, [xykPools.data])

  const stablePoolTotal = useMemo(() => {
    if (pools.data) {
      return pools.data.reduce((acc, pool) => {
        if (pool.meta.isStableSwap && pool.balance && pool.spotPrice) {
          acc = acc.plus(
            pool.balance.freeBalance
              .shiftedBy(-pool.meta.decimals)
              .times(pool.spotPrice),
          )
        }
        return acc
      }, BN_0)
    }
    return BN_0
  }, [pools.data])

  const filteredPools = useMemo(() => {
    const myPools = (pools.data ?? []).filter((pool) => pool.isPositions)

    return search ? arraySearch(myPools, search, ["symbol", "name"]) : myPools
  }, [pools.data, search])

  const filteredXYKPools = useMemo(() => {
    const myPools = (xykPools.data ?? []).filter((pool) => pool.isPositions)

    return search ? arraySearch(myPools, search, ["symbol", "name"]) : myPools
  }, [xykPools.data, search])

  if (id != null) {
    const pool = [...(pools.data ?? []), ...(xykPools.data ?? [])].find(
      (pool) => pool.id === id.toString(),
    )

    const isLoading = pools.isLoading || xykPools.isInitialLoading

    if (!pool && isLoading) return <PoolSkeleton />

    if (!pool?.isPositions) {
      navigate({
        search: { ...searchQuery, id: undefined },
      })
    }

    if (pool) return <PoolWrapper pool={pool} />
  }

  if (pools.data?.length === 0 && xykPools.data?.length === 0)
    return <Navigate to={LINKS.allPools} />

  return (
    <>
      <HeaderValues
        fontSizeLabel={14}
        skeletonHeight={19}
        values={[
          {
            label: t("liquidity.header.myTotal"),
            content: (
              <MyLiquidityTotal
                xykTotal={xykTotal}
                stablePoolTotal={stablePoolTotal}
                isLoading={pools.isLoading || xykPools.isInitialLoading}
              />
            ),
          },
          {
            label: t("liquidity.header.omnipool"),
            content: <MyOmnipoolTotal />,
          },
          {
            label: t("liquidity.header.stablepool"),
            content: (
              <HeaderTotalData
                isLoading={pools.isLoading}
                value={stablePoolTotal}
                fontSize={19}
              />
            ),
          },
          {
            label: t("liquidity.header.isolated"),
            withoutSeparator: true,
            content: (
              <HeaderTotalData
                isLoading={xykPools.isInitialLoading}
                value={xykTotal}
                fontSize={19}
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

      {!pools.isLoading &&
        !xykPools.isInitialLoading &&
        !filteredPools.length &&
        !filteredXYKPools.length && <EmptySearchState />}

      <div sx={{ flex: "column" }}>
        {pools.isLoading || !!filteredPools.length ? (
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
              <TableLabel label={t("liquidity.section.xyk")} />
              <CreateXYKPoolModalButton
                disabled={xykPools.isInitialLoading}
                sx={{ mb: 14, width: ["100%", "auto"] }}
              />
            </div>
            {xykPools.isInitialLoading ? (
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
