import { useRpcProvider } from "providers/rpcProvider"
import { useXYKPools } from "sections/pools/PoolsPage.utils"
import { PoolSkeleton } from "sections/pools/skeleton/PoolSkeleton"
import { XYKPool } from "sections/pools/pool/xyk/XYKPool"
import { HeaderValues } from "sections/pools/header/PoolsHeader"
import { HeaderTotalData } from "sections/pools/header/PoolsHeaderTotal"
import { useTranslation } from "react-i18next"
import { useMemo } from "react"
import { BN_0 } from "utils/constants"
import { SearchFilter } from "sections/pools/filter/SearchFilter"
import { useSearchFilter } from "sections/pools/filter/SearchFilter.utils"
import { arraySearch } from "utils/helpers"

export const IsolatedPools = () => {
  const { t } = useTranslation()
  const { isLoaded } = useRpcProvider()

  if (!isLoaded)
    return (
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
        <div sx={{ flex: "column", gap: 20 }}>
          {[...Array(3)].map((_, index) => (
            <PoolSkeleton key={index} length={3} index={index} />
          ))}
        </div>
      </>
    )

  return <IsolatedPoolsData />
}

const IsolatedPoolsData = () => {
  const { t } = useTranslation()
  const { search } = useSearchFilter()
  const xylPools = useXYKPools()

  const totalLocked = useMemo(() => {
    if (xylPools.data) {
      return xylPools.data.reduce((acc, xykPool) => {
        return acc.plus(xykPool.totalDisplay ?? BN_0)
      }, BN_0)
    }
    return BN_0
  }, [xylPools.data])

  const totalVolume = useMemo(() => {
    if (xylPools.data) {
      return xylPools.data.reduce((acc, xykPool) => {
        return acc.plus(xykPool.volumeDisplay ?? BN_0)
      }, BN_0)
    }
    return BN_0
  }, [xylPools.data])

  const filteredPools =
    search && xylPools.data
      ? arraySearch(xylPools.data, search, ["symbol", "name"])
      : xylPools.data

  return (
    <>
      <HeaderValues
        values={[
          {
            label: t("liquidity.header.isolated"),
            content: (
              <HeaderTotalData
                isLoading={xylPools.isLoading}
                value={totalLocked}
              />
            ),
          },
          {
            withoutSeparator: true,
            label: t("liquidity.header.24hours"),
            content: (
              <HeaderTotalData
                isLoading={xylPools.isLoading}
                value={totalVolume.div(2)}
              />
            ),
          },
        ]}
      />
      <SearchFilter />
      <div sx={{ flex: "column", gap: 20 }}>
        {xylPools.isLoading
          ? [...Array(3)].map((_, index) => (
              <PoolSkeleton key={index} length={3} index={index} />
            ))
          : filteredPools?.map((pool) => <XYKPool key={pool.id} pool={pool} />)}
      </div>
    </>
  )
}
