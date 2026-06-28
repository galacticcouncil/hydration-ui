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
    <Flex align="center">
      {value === "-1" ? (
        <Text lh={1} fs={fontSize} color={getToken("accents.success.emphasis")}>
          <InfinityIcon sx={{ size: "1em", scale: 1.25 }} />
        </Text>
      ) : (
        <Text fw={700} fs={fontSize} lh={1.5} sx={{ color: healthFactorColor }}>
          {healthFactor}
        </Text>
      )}
    </Flex>
  )
}
