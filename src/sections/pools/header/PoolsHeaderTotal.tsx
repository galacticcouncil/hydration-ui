import { Heading } from "components/Typography/Heading/Heading"
import { Trans, useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { Text } from "components/Typography/Text/Text"
import {
  useTotalInFarms,
  useTotalInPools,
  useUsersTotalInPools,
} from "sections/pools/header/PoolsHeaderTotal.utils"
import BN from "bignumber.js"
import { useAllUserDepositShare } from "../farms/position/FarmingPosition.utils"
import { BN_0 } from "utils/constants"
import { useMemo } from "react"
import { separateBalance } from "utils/balance"
import { theme } from "theme"
import { css } from "@emotion/react"
import {
  useTotalVolumesInPools,
  useTotalVolumesInPoolsUser,
} from "./PoolsHeaderVolume.utils"

type Props = {
  myPositions: boolean
  variant: "pools" | "farms" | "volume"
}

export const PoolsHeaderTotal = ({ myPositions, variant }: Props) => {
  if (myPositions && variant === "pools") {
    return <PoolsHeaderTotalPoolsUser />
  }
  if (!myPositions && variant === "pools") {
    return <PoolsHeaderTotalPools />
  }
  if (myPositions && variant === "farms") {
    return <PoolsHeaderTotalFarmsUser />
  }
  if (!myPositions && variant === "farms") {
    return <PoolsHeaderTotalFarms />
  }
  if (myPositions && variant === "volume") {
    return <PoolsHeaderTotalVolumeUser />
  }

  if (!myPositions && variant === "volume") {
    return <PoolsHeaderTotalVolume />
  }

  return null
}

export const HeaderTotalData = ({
  value,
  isLoading,
  fontSize,
}: {
  value: BN | undefined
  isLoading: boolean
  fontSize?: [number, number]
}) => {
  const { t } = useTranslation()

  if (isLoading)
    return <Skeleton sx={{ height: fontSize ?? [19, 28], width: [180, 200] }} />

  return (
    <Heading
      as="h3"
      sx={{ fontSize: fontSize ?? [19, 28], fontWeight: 500 }}
      css={{ whiteSpace: "nowrap" }}
    >
      <Text
        font="ChakraPetch"
        fw={900}
        fs={fontSize ?? [19, 28]}
        sx={{ display: "inline-block" }}
      >
        $
      </Text>
      <Trans
        t={t}
        i18nKey="wallet.assets.header.value"
        tOptions={{
          ...separateBalance(value, {
            type: "dollar",
          }),
        }}
      >
        <span
          sx={{
            fontSize: [19, 20],
          }}
          css={css`
            color: rgba(${theme.rgbColors.white}, 0.4);
          `}
        />
      </Trans>
    </Heading>
  )
}

const PoolsHeaderTotalPools = () => {
  const { data, isLoading } = useTotalInPools()
  return <HeaderTotalData value={data} isLoading={isLoading} />
}

const PoolsHeaderTotalPoolsUser = () => {
  const { data, isLoading } = useUsersTotalInPools()
  return <HeaderTotalData value={data} isLoading={isLoading} />
}

const PoolsHeaderTotalFarms = () => {
  const totalInFarms = useTotalInFarms()

  return (
    <HeaderTotalData
      value={totalInFarms.data}
      isLoading={totalInFarms.isLoading}
    />
  )
}

const PoolsHeaderTotalFarmsUser = () => {
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
    />
  )
}

const PoolsHeaderTotalVolume = () => {
  const { value, isLoading } = useTotalVolumesInPools()
  return <HeaderTotalData value={value} isLoading={isLoading} />
}

const PoolsHeaderTotalVolumeUser = () => {
  const { value, isLoading } = useTotalVolumesInPoolsUser()
  return <HeaderTotalData value={value} isLoading={isLoading} />
}
