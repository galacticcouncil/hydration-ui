import { Box, Text } from "@/components"
import { getToken } from "@/utils"

export type ChartCrosshairProps = {
  date: string
  time: string
}

export const ChartCrosshair: React.FC<ChartCrosshairProps> = ({
  date,
  time,
}) => {
  return (
    <Box>
      <Text
        align="center"
        fs="p5"
        color={getToken("text.low")}
        fw={500}
        whiteSpace="nowrap"
      >
        {date}
      </Text>
      <Text
        align="center"
        fs="p3"
        color={getToken("text.medium")}
        fw={500}
        whiteSpace="nowrap"
      >
        {time}
      </Text>
    </Box>
  )
}
