import { Text } from "components/Typography/Text/Text"
import { SPositions } from "../pool/Pool.styled"
import { useTranslation } from "react-i18next"
import { FarmingPosition } from "./position/FarmingPosition"
import { Icon } from "components/Icon/Icon"
import { ReactComponent as FPIcon } from "assets/icons/PoolsAndFarms.svg"

export const FarmingPositionWrapper = ({ positions }: { positions: any }) => {
  const { t } = useTranslation()

  if (!positions.data.length) return null

  return (
    <SPositions>
      <div sx={{ flex: "row", align: "center", gap: 8, mb: 20 }}>
        <Icon size={13} sx={{ color: "brightBlue300" }} icon={<FPIcon />} />
        <Text fs={[16, 16]} color="brightBlue300">
          {t("farms.positions.header.title")}
        </Text>
      </div>

      <div sx={{ flex: "column", gap: 16 }}>
        {positions.data.map((position, i) => (
          <FarmingPosition key={i} index={i + 1} />
        ))}
      </div>
    </SPositions>
  )
}
