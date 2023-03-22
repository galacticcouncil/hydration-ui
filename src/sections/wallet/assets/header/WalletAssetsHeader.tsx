import BN from "bignumber.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { useAllUserDepositShare } from "sections/pools/farms/position/FarmingPosition.utils"
import { Separator } from "components/Separator/Separator"
import { theme } from "theme"
import { BN_0 } from "utils/constants"
import { useHydraPositionsData } from "../hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import { useAssetsTableData } from "../table/data/WalletAssetsTableData.utils"
import { WalletAssetsHeaderValue } from "./WalletAssetsHeaderValue"

const enabledFarms = import.meta.env.VITE_FF_FARMS_ENABLED === "true"

type Props = { disconnected?: boolean }

export const WalletAssetsHeader = ({ disconnected }: Props) => {
  return (
    <div
      sx={{ flex: ["column", "row"], align: ["start", "center"], mb: [20, 56] }}
    >
      <WalletAssetsHeaderBalance disconnected={disconnected} />
      <HeaderSeparator />
      <WalletAssetsHeaderOmnipool disconnected={disconnected} />
      {enabledFarms && (
        <>
          <HeaderSeparator />
          <WalletAssetsHeaderFarms disconnected={disconnected} />
        </>
      )}
    </div>
  )
}

const WalletAssetsHeaderBalance = ({ disconnected }: Props) => {
  const { t } = useTranslation()
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
    <WalletAssetsHeaderValue
      value={totalUsd}
      title={t("wallet.assets.header.balance")}
      isLoading={assets.isLoading}
      disconnected={disconnected}
    />
  )
}

const WalletAssetsHeaderOmnipool = ({ disconnected }: Props) => {
  const { t } = useTranslation()
  const positions = useHydraPositionsData()

  const amount = useMemo(() => {
    if (!positions.data) return BN_0

    return positions.data.reduce(
      (acc, { valueUSD }) => acc.plus(BN(valueUSD)),
      BN_0,
    )
  }, [positions.data])

  return (
    <WalletAssetsHeaderValue
      value={amount}
      title={t("wallet.assets.header.positions")}
      isLoading={positions.isLoading}
      disconnected={disconnected}
    />
  )
}

const WalletAssetsHeaderFarms = ({ disconnected }: Props) => {
  const { t } = useTranslation()
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
    <WalletAssetsHeaderValue
      value={calculatedShares}
      title={t("wallet.assets.header.farms")}
      isLoading={depositShares.isLoading}
      disconnected={disconnected}
    />
  )
}

const HeaderSeparator = () => {
  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <div sx={{ flexGrow: [0, 0.5], width: ["100%", "auto"] }}>
      <Separator
        sx={{ my: [16, 0], height: [1, 72] }}
        css={{ background: `rgba(${theme.rgbColors.white}, 0.12)` }}
        orientation={isDesktop ? "vertical" : "horizontal"}
      />
    </div>
  )
}
