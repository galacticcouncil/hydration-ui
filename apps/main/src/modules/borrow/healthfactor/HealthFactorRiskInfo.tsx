import { Box, Flex, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, ReactNode } from "react"

interface HealthFactorRiskInfoProps {
  value: ReactNode
  title: ReactNode
  description: ReactNode
  scale: ReactNode
  hint: ReactNode
  color: string
}

export const HealthFactorRiskInfo: FC<HealthFactorRiskInfoProps> = ({
  value,
  title,
  description,
  scale,
  hint,
  color,
}) => {
  return (
    <Box
      p="xl"
      borderRadius="xl"
      bg={getToken("surfaces.containers.dim.dimOnBg")}
    >
      <Flex justify="space-between">
        <Stack justify="flex-start" gap="s" width="60%">
          <Text fs="p3">{title}</Text>
          <Text fs="p5" color={getToken("text.medium")}>
            {description}
          </Text>
        </Stack>
        <Flex
          size={64}
          borderRadius="full"
          bg={color}
          color="white"
          align="center"
          justify="center"
          sx={{ flexShrink: 0 }}
        >
          <Text fs="p4" fw={700}>
            {value}
          </Text>
        </Flex>
      </Flex>
      <Box>{scale}</Box>
      <Text fs="p5" color={getToken("text.medium")}>
        {hint}
      </Text>
    </Box>
  )
}
