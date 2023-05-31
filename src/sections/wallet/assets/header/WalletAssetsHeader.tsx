import BN from "bignumber.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useAllUserDepositShare } from "sections/pools/farms/position/FarmingPosition.utils"
import { BN_0 } from "utils/constants"
import { useHydraPositionsData } from "../hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import { useAssetsTableData } from "../table/data/WalletAssetsTableData.utils"
import { HeaderValues } from "sections/pools/header/PoolsHeader"
import { HeaderTotalData } from "sections/pools/header/PoolsHeaderTotal"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "sections/pools/pool/details/PoolValue.styled"
import { Text } from "components/Typography/Text/Text"

type Props = { disconnected?: boolean }

export const WalletAssetsHeader = ({ disconnected }: Props) => {
  const { t } = useTranslation()

  return (
    <HeaderValues
      skeletonHeight={[19, 42]}
      values={[
        {
          disconnected: disconnected,
          content: (
            <WalletAssetsHeaderBalance
              label={t("wallet.assets.header.balance")}
            />
          ),
        },
        {
          disconnected: disconnected,
          content: (
            <WalletAssetsHeaderOmnipool
              label={t("wallet.assets.header.positions")}
            />
          ),
        },
      ]}
    />
  )
}

const WalletAssetsHeaderBalance = ({ label }: { label: string }) => {
  const { t } = useTranslation()
  const assets = useAssetsTableData(false)
  const lpPositions = useHydraPositionsData()
  const farmsPositions = useAllUserDepositShare()

  const totalUsd = useMemo(() => {
    if (!assets.data) return BN_0

    return assets.data.reduce((acc, cur) => {
      if (!cur.totalUSD.isNaN()) {
        return acc.plus(cur.totalUSD)
      }
      return acc
    }, BN_0)
  }, [assets])

  const farmsAmount = useMemo(() => {
    let calculatedShares = BN_0
    for (const poolId in farmsPositions.data) {
      const poolTotal = farmsPositions.data[poolId].reduce((memo, share) => {
        return memo.plus(share.valueUSD)
      }, BN_0)
      calculatedShares = calculatedShares.plus(poolTotal)
    }
    return calculatedShares
  }, [farmsPositions])

  const lpAmount = useMemo(() => {
    if (!lpPositions.data) return BN_0

    return lpPositions.data.reduce(
      (acc, { valueUSD }) => acc.plus(BN(valueUSD)),
      BN_0,
    )
  }, [lpPositions.data])

  const tooltip = (
    <div sx={{ flex: "column", gap: 14, width: 220 }}>
      <Text fs={11}>{t("wallet.assets.header.balance.tooltip.title")}</Text>

      <div sx={{ flex: "column", gap: 2 }}>
        <Text fs={8} tTransform="uppercase" color="basic500">
          {t("wallet.assets.header.balance.tooltip.assets")}
        </Text>
        <Text fs={12}>{t("value.usd", { amount: totalUsd })}</Text>
      </div>

      <div sx={{ flex: "column", gap: 2 }}>
        <Text fs={8} tTransform="uppercase" color="basic500">
          {t("wallet.assets.header.balance.tooltip.positions")}
        </Text>
        <Text fs={12}>{t("value.usd", { amount: lpAmount })}</Text>
      </div>

      <div sx={{ flex: "column", gap: 2 }}>
        <Text fs={8} tTransform="uppercase" color="basic500">
          {t("wallet.assets.header.balance.tooltip.farms")}
        </Text>
        <Text fs={12}>{t("value.usd", { amount: farmsAmount })}</Text>
      </div>
    </div>
  )

  return (
    <div sx={{ flex: ["row", "column"], justify: "space-between" }}>
      <div sx={{ flex: "row", gap: 8, align: "center", mb: 6 }}>
        <Text color="brightBlue300">{label}</Text>

        <InfoTooltip text={tooltip}>
          <SInfoIcon />
        </InfoTooltip>
      </div>

      <HeaderTotalData
        value={totalUsd.plus(farmsAmount).plus(lpAmount)}
        isLoading={
          assets.isLoading || lpPositions.isLoading || farmsPositions.isLoading
        }
        fontSize={[19, 42]}
      />
    </div>
  )
}

const WalletAssetsHeaderOmnipool = ({ label }: { label: string }) => {
  const { t } = useTranslation()
  const lpPositions = useHydraPositionsData()
  const farmsPositions = useAllUserDepositShare()

  const farmsAmount = useMemo(() => {
    let calculatedShares = BN_0
    for (const poolId in farmsPositions.data) {
      const poolTotal = farmsPositions.data[poolId].reduce((memo, share) => {
        return memo.plus(share.valueUSD)
      }, BN_0)
      calculatedShares = calculatedShares.plus(poolTotal)
    }
    return calculatedShares
  }, [farmsPositions])

  const lpAmount = useMemo(() => {
    if (!lpPositions.data) return BN_0

    return lpPositions.data.reduce(
      (acc, { valueUSD }) => acc.plus(BN(valueUSD)),
      BN_0,
    )
  }, [lpPositions.data])

  const tooltip = (
    <div sx={{ flex: "column", gap: 14, width: 210 }}>
      <Text fs={11}>{t("wallet.assets.header.positions.tooltip.title")}</Text>

      <div sx={{ flex: "column", gap: 2 }}>
        <Text fs={8} tTransform="uppercase" color="basic500">
          {t("wallet.assets.header.balance.tooltip.positions")}
        </Text>
        <Text fs={12}>{t("value.usd", { amount: lpAmount })}</Text>
      </div>

      <div sx={{ flex: "column", gap: 2 }}>
        <Text fs={8} tTransform="uppercase" color="basic500">
          {t("wallet.assets.header.balance.tooltip.farms")}
        </Text>
        <Text fs={12}>{t("value.usd", { amount: farmsAmount })}</Text>
      </div>
    </div>
  )

  return (
    <div sx={{ flex: ["row", "column"], justify: "space-between" }}>
      <div sx={{ flex: "row", gap: 8, align: "center", mb: 6 }}>
        <Text color="brightBlue300">{label}</Text>
        <InfoTooltip text={tooltip}>
          <SInfoIcon />
        </InfoTooltip>
      </div>
      <HeaderTotalData
        value={lpAmount.plus(farmsAmount)}
        isLoading={lpPositions.isLoading || farmsPositions.isLoading}
        fontSize={[19, 42]}
      />
    </div>
  )
}
