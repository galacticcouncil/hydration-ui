import { InfinityIcon } from "@galacticcouncil/ui/assets/icons"
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
  fontSize,
}) => {
  const { healthFactor, healthFactorColor } = useFormattedHealthFactor(value)

  return (
    <Flex>
      {value === "-1" ? (
        <Text
          fw={500}
          fs={fontSize}
          lh={1.5}
          color={getToken("accents.success.emphasis")}
        >
          <InfinityIcon />
        </Text>
      ) : (
        <Text fw={700} fs={fontSize} lh={1.5} sx={{ color: healthFactorColor }}>
          {healthFactor}
        </Text>
      )}
    </Flex>
  )
}
