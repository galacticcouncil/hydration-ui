import { Flex, Text } from "@galacticcouncil/ui/components"
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
    <Flex>
      {value === "-1" ? (
        <Text
          fw={500}
          fs={fontSize}
          color={getToken("accents.success.emphasis")}
          sx={{ scale: "1.3" }}
        >
          ∞
        </Text>
      ) : (
        <Text fw={700} fs={fontSize} sx={{ color: healthFactorColor }}>
          {healthFactor}
        </Text>
      )}
    </Flex>
  )
}
