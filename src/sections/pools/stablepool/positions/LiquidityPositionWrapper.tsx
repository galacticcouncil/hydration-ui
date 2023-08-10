import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { LiquidityPosition } from "./LiquidityPosition"
import { ReactComponent as DropletIcon } from "assets/icons/DropletIcon.svg"
import { Icon } from "components/Icon/Icon"
import { SPositions } from '../../pool/Pool.styled'

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
        <Icon size={15} sx={{ color: "vibrantBlue200" }} icon={<DropletIcon />} />
        <Text fs={[16, 16]} color="vibrantBlue200">
          {t("liquidity.stablepool.asset.positions.title")}
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
