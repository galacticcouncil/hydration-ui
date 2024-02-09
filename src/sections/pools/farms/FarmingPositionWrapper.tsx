import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { FarmingPosition } from "./position/FarmingPosition"
import { Icon } from "components/Icon/Icon"
import FPIcon from "assets/icons/PoolsAndFarms.svg?react"
import { ClaimRewardsCard } from "./components/claimableCard/ClaimRewardsCard"
import { Spacer } from "components/Spacer/Spacer"
import { TPool, TPoolDetails } from "sections/pools/PoolsPage.utils"

interface Props {
  pool: TPool
  positions: TPoolDetails["miningNftPositions"]
}

export const FarmingPositionWrapper = ({ pool, positions }: Props) => {
  const { t } = useTranslation()

  if (!positions.length) return null

  return (
    <div>
      <div sx={{ flex: "row", align: "center", gap: 8, mb: 20 }}>
        <Icon size={13} sx={{ color: "brightBlue300" }} icon={<FPIcon />} />
        <Text fs={[16, 16]} color="brightBlue300">
          {t("farms.positions.header.title")}
        </Text>
      </div>

      <ClaimRewardsCard poolId={pool.id} />
      <Spacer size={12} />

      <div sx={{ flex: "column", gap: 16 }}>
        {positions.map((item, i) => (
          <FarmingPosition
            key={i}
            poolId={pool.id}
            index={i + 1}
            depositNft={item}
          />
        ))}
      </div>
    </div>
  )
}
