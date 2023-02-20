import { Text } from "components/Typography/Text/Text"
import { SPositions } from "../Pool.styled"
import { useTranslation } from "react-i18next"
import { LiquidityPosition } from "./LiquidityPosition"
import { usePoolPositions } from "../Pool.utils"
import { ReactComponent as LPIcon } from "assets/icons/LPIcon.svg"
import { Icon } from "components/Icon/Icon"

type Positions = ReturnType<typeof usePoolPositions>

export const LiquidityPositionWrapper = ({
  positions,
}: {
  positions: Positions
}) => {
  const { t } = useTranslation()

  if (!positions.data.length) return null

  return (
    <SPositions>
      <div sx={{ flex: "row", align: "center", gap: 8, mb: 20 }}>
        <Icon size={13} sx={{ color: "pink600" }} icon={<LPIcon />} />
        <Text fs={[16, 16]} color="pink600">
          {t("liquidity.asset.positions.title")}
        </Text>
      </div>
      <div sx={{ flex: "column", gap: 16 }}>
        {positions.data.map((position, i) => (
          <LiquidityPosition
            key={`${i}-${position.assetId}`}
            position={position}
            index={i + 1}
            onSuccess={positions.refetch}
          />
        ))}
      </div>
    </SPositions>
  )
}
