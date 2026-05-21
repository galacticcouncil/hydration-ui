import {
  Stack,
  StackProps,
  ValueStats,
  ValueStatsSize,
} from "@galacticcouncil/ui/components"
import { FC } from "react"

type HeaderValuesSkeletonProps = Omit<StackProps, "children"> & {
  size?: ValueStatsSize
  wrap?: boolean
  count: number
}

export const HeaderValuesSkeleton: FC<HeaderValuesSkeletonProps> = ({
  count,
  wrap,
  size = "medium",
  ...props
}) => {
  return (
    <Stack {...props}>
      {Array.from({ length: count }, (_, i) => (
        <ValueStats
          key={i}
          size={size}
          label={String.fromCharCode(160)}
          isLoading
          wrap={wrap}
        />
      ))}
    </Stack>
  )
}
