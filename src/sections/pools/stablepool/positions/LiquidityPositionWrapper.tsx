import { Text } from "components/Typography/Text/Text"
import { SPositions } from "./LiquidityPosition.styled"
import { useTranslation } from "react-i18next"
import { LiquidityPosition } from "./LiquidityPosition"
import { ReactComponent as ChartIcon } from "assets/icons/ChartIcon.svg"
import { Icon } from "components/Icon/Icon"

export const LiquidityPositionWrapper = () => {
  const { t } = useTranslation()

  const positions = [
    {
      id: 1,
    },
    {
      id: 2,
    },
  ]

  return (
    <SPositions>
      <div sx={{ flex: "row", align: "center", gap: 8, mb: 20 }}>
        <Icon size={13} sx={{ color: "pink600" }} icon={<ChartIcon />} />
        <Text fs={[16, 16]} color="pink600">
          {t("liquidity.asset.positions.title")}
        </Text>
      </div>
      <div sx={{ flex: "column", gap: 16 }}>
        {positions.map((position) => (
          <LiquidityPosition key={position.id} />
        ))}
      </div>
    </SPositions>
  )
}
