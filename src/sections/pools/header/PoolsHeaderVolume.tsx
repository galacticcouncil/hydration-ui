import {
  useTotalVolumesInPools,
  useTotalVolumesInPoolsUser,
} from "./PoolsHeaderVolume.utils"
import { Text } from "../../../components/Typography/Text/Text"
import Skeleton from "react-loading-skeleton"
import { Heading } from "../../../components/Typography/Heading/Heading"
import { Trans, useTranslation } from "react-i18next"
import BN from "bignumber.js"
import { separateBalance } from "utils/balance"
import { css } from "@emotion/react"
import { theme } from "theme"

type Props = { myPositions: boolean; variant: "pools" | "farms" }

const PoolsHeaderTotalVolumeData = ({
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

const PoolsHeaderTotalVolume = () => {
  const { value, isLoading } = useTotalVolumesInPools()
  return <PoolsHeaderTotalVolumeData value={value} isLoading={isLoading} />
}

const PoolsHeaderTotalVolumeUser = () => {
  const { value, isLoading } = useTotalVolumesInPoolsUser()
  return <PoolsHeaderTotalVolumeData value={value} isLoading={isLoading} />
}

export const PoolsHeaderVolume = ({ myPositions, variant }: Props) => {
  if (myPositions && variant === "pools") {
    return <PoolsHeaderTotalVolumeUser />
  }

  if (!myPositions && variant === "pools") {
    return <PoolsHeaderTotalVolume />
  }

  return null
}
