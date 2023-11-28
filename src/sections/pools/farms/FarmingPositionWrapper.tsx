import { Text } from "components/Typography/Text/Text"
import { SPositions } from "sections/pools/pool/Pool.styled"
import { useTranslation } from "react-i18next"
import { FarmingPosition } from "./position/FarmingPosition"
import { Icon } from "components/Icon/Icon"
import FPIcon from "assets/icons/PoolsAndFarms.svg?react"
import { useMedia } from "react-use"
import { theme } from "theme"
import { ClaimRewardsCard } from "./components/claimableCard/ClaimRewardsCard"
import { Spacer } from "components/Spacer/Spacer"
import { TOmnipoolAsset } from "sections/pools/PoolsPage.utils"

interface Props {
  pool: TOmnipoolAsset
}

export const FarmingPositionWrapper = ({ pool }: Props) => {
  const { t } = useTranslation()
  const isDektop = useMedia(theme.viewport.gte.sm)

  if (!pool.miningNftPositions?.length) return null
  return (
    <SPositions>
      <div sx={{ flex: "row", align: "center", gap: 8, mb: 20 }}>
        <Icon size={13} sx={{ color: "brightBlue300" }} icon={<FPIcon />} />
        <Text fs={[16, 16]} color="brightBlue300">
          {t("farms.positions.header.title")}
        </Text>
      </div>

      {!isDektop && (
        <>
          <ClaimRewardsCard poolId={pool.id} />
          <Spacer size={12} />
        </>
      )}

      <div sx={{ flex: "column", gap: 16 }}>
        {pool.miningNftPositions?.map((item, i) => (
          <FarmingPosition
            key={i}
            poolId={pool.id}
            index={i + 1}
            depositNft={item}
          />
        ))}
      </div>
    </SPositions>
  )
}
