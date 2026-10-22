import { StylePropertyValue } from "@theme-ui/css"

import { BarChartSkeleton, LineChartSkeleton } from "@/assets/visuals"
import { Box, Flex } from "@/components"
import { getToken } from "@/utils"

export type ChartSkeletonProps = {
  children?: React.ReactNode
  color?: StylePropertyValue<"color">
  className?: string
  variant?: "line" | "bar"
}

export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({
  children,
  color,
  className,
  variant = "line",
}) => {
  const Skeleton = variant === "bar" ? BarChartSkeleton : LineChartSkeleton

  return (
    <Flex
      align="end"
      justify="center"
      sx={{ position: "relative", width: "100%" }}
      className={className}
    >
      <Skeleton
        width="95%"
        height="80%"
        sx={{
          filter: "blur(10px)",
          opacity: 0.1,
          color: color || getToken("text.medium"),
        }}
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
