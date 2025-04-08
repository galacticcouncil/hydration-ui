import { StylePropertyValue } from "@theme-ui/css"

import { LineChartSkeleton } from "@/assets/visuals"
import { Box, Flex } from "@/components"
import { getToken } from "@/utils"

export type ChartSkeletonProps = {
  height?: number
  children?: React.ReactNode
  color?: StylePropertyValue<"color">
}

export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({
  height,
  children,
  color,
}) => {
  return (
    <Flex
      align="end"
      justify="center"
      sx={{ position: "relative", height, width: "100%" }}
    >
      <LineChartSkeleton
        width="95%"
        height="80%"
        sx={{ filter: "blur(15px)", color: color || getToken("details.chart") }}
      />
      {children && (
        <Box
          sx={{
            color: getToken("text.medium"),
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {children}
        </Box>
      )}
    </Flex>
  )
}
