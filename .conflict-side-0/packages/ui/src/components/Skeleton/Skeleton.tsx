import "react-loading-skeleton/dist/skeleton.css"

import SkeletonPrimitive from "react-loading-skeleton"

import { useTheme } from "@/theme"

export type SkeletonProps = React.ComponentPropsWithoutRef<
  typeof SkeletonPrimitive
>

export const Skeleton: React.FC<SkeletonProps> = (props) => {
  const { getToken } = useTheme()
  return (
    <SkeletonPrimitive
      baseColor={getToken("details.skeleton")}
      highlightColor={getToken("details.skeleton")}
      {...props}
    />
  )
}
