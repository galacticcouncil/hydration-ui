import { useRpcProvider } from "providers/rpcProvider"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useOmnipoolAndStablepool } from "sections/pools/PoolsPage.utils"
import { HeaderValues } from "sections/pools/header/PoolsHeader"
import { HeaderTotalData } from "sections/pools/header/PoolsHeaderTotal"
import { Pool } from "sections/pools/pool/Pool"
import { PoolSkeleton } from "sections/pools/skeleton/PoolSkeleton"
import { BN_0 } from "utils/constants"

export const AllPools = () => {
  const { t } = useTranslation()
  const { isLoaded } = useRpcProvider()

  if (!isLoaded)
    return (
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

  return <AllPoolsData />
}

const AllPoolsData = () => {
  const { t } = useTranslation()
  const omnipoolAndStablepool = useOmnipoolAndStablepool()

  const omnipoolTotal = useMemo(() => {
    if (omnipoolAndStablepool.data) {
      return omnipoolAndStablepool.data.reduce(
        (acc, asset) => acc.plus(asset.totalDisplay),
        BN_0,
      )
    }

    return BN_0
  }, [omnipoolAndStablepool.data])

  const stablepoolTotal = useMemo(() => {
    if (omnipoolAndStablepool.data) {
      return omnipoolAndStablepool.data.reduce(
        (acc, asset) => acc.plus(asset.stablepoolTotal.value),
        BN_0,
      )
    }

    return BN_0
  }, [omnipoolAndStablepool.data])

  const omnipoolTradeTotal = useMemo(() => {
    return (
      omnipoolAndStablepool.data?.reduce(
        (acc, item) => acc.plus(item.volumeDisplay ?? 0),
        BN_0,
      ) ?? BN_0
    )
  }, [omnipoolAndStablepool.data])

  return (
    <>
      <HeaderValues
        values={[
          {
            label: t("liquidity.header.omnipool"),
            content: (
              <HeaderTotalData
                isLoading={omnipoolAndStablepool.isLoading}
                value={omnipoolTotal}
              />
            ),
          },
          {
            label: t("liquidity.header.stablepool"),
            content: (
              <HeaderTotalData
                isLoading={omnipoolAndStablepool.isLoading}
                value={stablepoolTotal}
              />
            ),
          },
          {
            withoutSeparator: true,
            label: t("liquidity.header.24hours"),
            content: (
              <HeaderTotalData
                isLoading={omnipoolAndStablepool.isLoading}
                value={omnipoolTradeTotal.div(2)}
              />
            ),
          },
        ]}
      />
      <div sx={{ flex: "column", gap: 20 }}>
        {omnipoolAndStablepool.isLoading
          ? [...Array(3)].map((_, index) => (
              <PoolSkeleton key={index} length={3} index={index} />
            ))
          : omnipoolAndStablepool.data?.map((pool) => (
              <Pool key={pool.id} pool={pool} />
            ))}
      </div>
    </>
  )
}
