import { LOGO_SIZES } from "@/components/Logo/Logo.styled"
import { Skeleton } from "@/components/Skeleton"
import { pxToRem } from "@/utils"

import { LogoSize } from "./Logo"

export type LogoSkeletonProps = {
  size: LogoSize
}

export const LogoSkeleton: React.FC<LogoSkeletonProps> = ({ size }) => {
  return (
    <Skeleton
      sx={{ size: pxToRem(LOGO_SIZES[size]), display: "flex" }}
      circle
    />
  )
}
