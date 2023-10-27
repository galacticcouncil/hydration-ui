import { Navigate } from "@tanstack/react-location"
import { useRpcProvider } from "providers/rpcProvider"
import {
  useAccountOmnipoolPositions,
  useOmnipoolAndStablepool,
} from "sections/pools/PoolsPage.utils"
import { HeaderTotalData } from "sections/pools/header/PoolsHeaderTotal"
import { HeaderValues } from "sections/pools/header/PoolsHeader"
import { useTranslation } from "react-i18next"
import { PoolSkeleton } from "sections/pools/skeleton/PoolSkeleton"
import { Pool } from "sections/pools/pool/Pool"
import { useMemo } from "react"
import { BN_0 } from "utils/constants"
import { useAllUserDepositShare } from "sections/pools/farms/position/FarmingPosition.utils"
import { ClaimAllDropdown } from "sections/pools/farms/components/claimAllDropdown/ClaimAllDropdown"

const poolsWithMyPositions = true

export const MyLiquidity = () => {
  const { isLoaded } = useRpcProvider()
  const { t } = useTranslation()

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
              label: t("liquidity.header.totalInFarms"),
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

  return <MyLiquidityData />
}

const MyLiquidityData = () => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const omnipoolAndStablepool = useOmnipoolAndStablepool(poolsWithMyPositions)

  const miningPositions = useAllUserDepositShare()

  const accountPositions = useAccountOmnipoolPositions()

  const isOmnipoolPositions =
    accountPositions.data?.miningNfts.length ||
    accountPositions.data?.omnipoolNfts.length

  const totalOmnipool = useMemo(() => {
    if (omnipoolAndStablepool.data) {
      return omnipoolAndStablepool.data
        .map((pool) =>
          pool.omnipoolNftPositions.reduce((acc, position) => {
            return acc.plus(position.valueDisplay)
          }, BN_0),
        )
        .reduce((acc, poolTotal) => {
          return acc.plus(poolTotal)
        }, BN_0)
    }
    return BN_0
  }, [omnipoolAndStablepool.data])

  const totalStablepool = useMemo(() => {
    if (omnipoolAndStablepool.data) {
      return omnipoolAndStablepool.data.reduce((acc, position) => {
        if (position.stablepoolUserPosition) {
          const meta = assets.getAsset(position.id)
          const providedAmountPrice = position.spotPrice
            ? position.stablepoolUserPosition
                .multipliedBy(position.spotPrice)
                .shiftedBy(-meta.decimals)
            : BN_0
          return acc.plus(providedAmountPrice)
        }
        return acc
      }, BN_0)
    }
    return BN_0
  }, [assets, omnipoolAndStablepool.data])

  const totalFarms = useMemo(() => {
    let calculatedShares = BN_0
    for (const poolId in miningPositions.data) {
      const poolTotal = miningPositions.data[poolId].reduce((memo, share) => {
        return memo.plus(share.valueDisplay)
      }, BN_0)
      calculatedShares = calculatedShares.plus(poolTotal)
    }
    return calculatedShares
  }, [miningPositions.data])

  if (accountPositions.data && !isOmnipoolPositions)
    return <Navigate to="/liquidity" />

  return (
    <>
      <HeaderValues
        values={[
          {
            label: t("liquidity.header.omnipool"),
            content: (
              <HeaderTotalData
                isLoading={omnipoolAndStablepool.isLoading}
                value={totalOmnipool}
              />
            ),
          },
          {
            label: t("liquidity.header.stablepool"),
            content: (
              <HeaderTotalData
                isLoading={omnipoolAndStablepool.isLoading}
                value={totalStablepool}
              />
            ),
          },
          {
            label: t("liquidity.header.totalInFarms"),
            withoutSeparator: true,
            content: (
              <HeaderTotalData
                isLoading={miningPositions.isLoading}
                value={totalFarms}
              />
            ),
          },
          {
            initiallyHidden: true,
            content: <ClaimAllDropdown />,
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
