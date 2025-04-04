import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { FC, ReactNode } from "react"
import { StrategyRiskLevel } from "sections/wallet/strategy/StrategyTile/StrategyTile.data"

type Variant = "default" | `risk:${StrategyRiskLevel}`

type Props = {
  readonly label: string
  readonly value: string
  readonly icon?: ReactNode
  readonly variant?: Variant
}

export const AssetOverviewTile: FC<Props> = ({
  label,
  value,
  icon,
  variant,
}) => {
  return (
    <div sx={{ flex: "column", gap: 8 }}>
      <div sx={{ flex: "row", gap: 4, align: "center" }}>
        <Text fw={500} fs={14} color="basic400">
          {label}
        </Text>
        {icon && <Icon icon={icon} size={14} />}
      </div>
      <Text
        fw={500}
        fs={16}
        lh="1"
        css={{ textTransform: "capitalize" }}
        color={(() => {
          switch (variant) {
            case "risk:low":
              return "brightBlue300"
            case `risk:moderate`:
              return "warningYellow300"
            case "risk:high":
              return "red500"
            default:
              return "white"
          }
        })()}
      >
        {value}
      </Text>
    </div>
  )
}
