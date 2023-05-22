import BN from "bignumber.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useAllUserDepositShare } from "sections/pools/farms/position/FarmingPosition.utils"
import { BN_0 } from "utils/constants"
import { useHydraPositionsData } from "../hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import { useAssetsTableData } from "../table/data/WalletAssetsTableData.utils"
import { HeaderValues } from "sections/pools/header/PoolsHeader"
import { HeaderTotalData } from "sections/pools/header/PoolsHeaderTotal"

const enabledFarms = import.meta.env.VITE_FF_FARMS_ENABLED === "true"

type Props = { disconnected?: boolean }

export const WalletAssetsHeader = ({ disconnected }: Props) => {
  const { t } = useTranslation()

  return (
    <HeaderValues
      skeletonHeight={[19, 42]}
      values={[
        {
          disconnected: disconnected,
          label: t("wallet.assets.header.balance"),
          content: <WalletAssetsHeaderBalance />,
        },
        {
          disconnected: disconnected,
          label: t("wallet.assets.header.positions"),
          content: <WalletAssetsHeaderOmnipool />,
        },
        {
          disconnected: disconnected,
          hidden: !enabledFarms,
          label: t("wallet.assets.header.farms"),
          content: <WalletAssetsHeaderFarms />,
        },
      ]}
    />
  )
}

const WalletAssetsHeaderBalance = () => {
  const assets = useAssetsTableData(false)

  const totalUsd = useMemo(() => {
    if (!assets.data) return BN_0

    return assets.data.reduce((acc, cur) => {
      if (!cur.totalUSD.isNaN()) {
        return acc.plus(cur.totalUSD)
      }
      return acc
    }, BN_0)
  }, [assets])

  return (
    <HeaderTotalData
      value={totalUsd}
      isLoading={assets.isLoading}
      fontSize={[19, 42]}
    />
  )
}

const WalletAssetsHeaderOmnipool = () => {
  const positions = useHydraPositionsData()

  const amount = useMemo(() => {
    if (!positions.data) return BN_0

    return positions.data.reduce(
      (acc, { valueUSD }) => acc.plus(BN(valueUSD)),
      BN_0,
    )
  }, [positions.data])

  return (
    <HeaderTotalData
      value={amount}
      isLoading={positions.isLoading}
      fontSize={[19, 42]}
    />
  )
}

const WalletAssetsHeaderFarms = () => {
  const depositShares = useAllUserDepositShare()

  const calculatedShares = useMemo(() => {
    let calculatedShares = BN_0
    for (const poolId in depositShares.data) {
      const poolTotal = depositShares.data[poolId].reduce((memo, share) => {
        return memo.plus(share.valueUSD)
      }, BN_0)
      calculatedShares = calculatedShares.plus(poolTotal)
    }
    return calculatedShares
  }, [depositShares])

  return (
    <HeaderTotalData
      value={calculatedShares}
      isLoading={depositShares.isLoading}
      fontSize={[19, 42]}
    />
  )
}
