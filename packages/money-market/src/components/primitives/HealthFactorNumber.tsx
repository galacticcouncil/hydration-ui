import { Flex, Text } from "@galacticcouncil/ui/components"
import { ThemeUICSSProperties } from "@galacticcouncil/ui/types"
import { getToken } from "@galacticcouncil/ui/utils"

import { useFormattedHealthFactor } from "@/hooks"

export type HealthFactorNumberProps = {
  value: string
  fontSize?: ThemeUICSSProperties["fontSize"]
}

export const HealthFactorNumber: React.FC<HealthFactorNumberProps> = ({
  value,
  fontSize = "p3",
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
