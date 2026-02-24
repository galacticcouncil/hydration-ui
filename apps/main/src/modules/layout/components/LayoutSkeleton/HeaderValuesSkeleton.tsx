import {
  Stack,
  StackProps,
  ValueStats,
  ValueStatsSize,
} from "@galacticcouncil/ui/components"
import { FC } from "react"

type HeaderValuesSkeletonProps = Omit<StackProps, "children"> & {
  size?: ValueStatsSize
  count: number
}

export const HeaderValuesSkeleton: FC<HeaderValuesSkeletonProps> = ({
  count,
  size = "medium",
  ...props
}) => {
  return (
    <Stack {...props}>
      {Array.from({ length: count }, (_, i) => (
        <ValueStats key={i} size={size} isLoading />
      ))}
    </Stack>
  )
}
