import "react-loading-skeleton/dist/skeleton.css"

import SkeletonPrimitive from "react-loading-skeleton"

import { useTheme } from "@/theme"

export type SkeletonProps = React.ComponentPropsWithoutRef<
  typeof SkeletonPrimitive
>

export const Skeleton: React.FC<SkeletonProps> = (props) => {
  const { themeProps } = useTheme()
  return (
    <SkeletonPrimitive
      baseColor={themeProps.Details.Skeleton}
      highlightColor={themeProps.Details.Skeleton}
      {...props}
    />
  )
}
