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

type Props = { myPositions: boolean; variant: "pools" | "farms" }

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
  return null
}

const PoolsHeaderTotalData = ({
  value,
  isLoading,
}: {
  value: BN | undefined
  isLoading: boolean
}) => {
  const { t } = useTranslation()

  return (
    <Heading as="h3" sx={{ fontSize: [19, 42], fontWeight: 500 }}>
      {!isLoading ? (
        <div css={{ whiteSpace: "nowrap" }}>
          <Text
            font="ChakraPetch"
            fw={900}
            fs={[19, 42]}
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
                fontSize: [19, 26],
              }}
              css={css`
                color: rgba(${theme.rgbColors.white}, 0.4);
              `}
            />
          </Trans>
        </div>
      ) : (
        <Skeleton width={256} />
      )}
    </Heading>
  )
}

const PoolsHeaderTotalPools = () => {
  const { data, isLoading } = useTotalInPools()
  return <PoolsHeaderTotalData value={data} isLoading={isLoading} />
}

const PoolsHeaderTotalPoolsUser = () => {
  const { data, isLoading } = useUsersTotalInPools()
  return <PoolsHeaderTotalData value={data} isLoading={isLoading} />
}

const PoolsHeaderTotalFarms = () => {
  const { t } = useTranslation()
  const totalInFarms = useTotalInFarms()

  return (
    <Heading as="h3" sx={{ fontSize: [19, 42], fontWeight: 500 }}>
      <div css={{ whiteSpace: "nowrap" }}>
        <Text
          font="ChakraPetch"
          fw={900}
          fs={[19, 42]}
          sx={{ display: "inline-block" }}
        >
          $
        </Text>
        <Trans
          t={t}
          i18nKey="wallet.assets.header.value"
          tOptions={{
            ...separateBalance(totalInFarms, {
              type: "dollar",
            }),
          }}
        >
          <span
            sx={{
              fontSize: [19, 26],
            }}
            css={css`
              color: rgba(${theme.rgbColors.white}, 0.4);
            `}
          />
        </Trans>
      </div>
    </Heading>
  )
}

const PoolsHeaderTotalFarmsUser = () => {
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
    <Heading as="h3" sx={{ fontSize: [19, 42], fontWeight: 500 }}>
      {depositShares.isLoading ? (
        <Skeleton width={256} />
      ) : (
        <div css={{ whiteSpace: "nowrap" }}>
          <Text
            font="ChakraPetch"
            fw={900}
            fs={[19, 42]}
            sx={{ display: "inline-block" }}
          >
            $
          </Text>
          <Trans
            t={t}
            i18nKey="wallet.assets.header.value"
            tOptions={{
              ...separateBalance(calculatedShares, {
                type: "dollar",
              }),
            }}
          >
            <span
              sx={{
                fontSize: [19, 26],
              }}
              css={css`
                color: rgba(${theme.rgbColors.white}, 0.4);
              `}
            />
          </Trans>
        </div>
      )}
    </Heading>
  )
}
