import { Text } from "@galacticcouncil/ui/components"
import { ResponsiveStyleValue } from "@galacticcouncil/ui/types"
import { getToken } from "@galacticcouncil/ui/utils"

import { useFormattedHealthFactor } from "@/hooks"

export type HealthFactorNumberProps = {
  value: string
  fontSize?: ResponsiveStyleValue<number>
}

export const HealthFactorNumber: React.FC<HealthFactorNumberProps> = ({
  value,
  fontSize = 14,
}) => {
  const { healthFactor, healthFactorColor } = useFormattedHealthFactor(value)

  return (
    <div
      sx={{
        flex: "row",
        gap: 10,
      }}
    >
      {value === "-1" ? (
        <Text
          fs={fontSize}
          color={getToken("accents.success.emphasis")}
          css={{ scale: "1.3" }}
        >
          ∞
        </Text>
      ) : (
        <Text fs={fontSize} css={{ color: healthFactorColor }}>
          {healthFactor}
        </Text>
      )}
    </div>
  )
}
