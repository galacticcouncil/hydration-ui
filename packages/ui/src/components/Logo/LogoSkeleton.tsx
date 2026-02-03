import { LOGO_SIZES } from "@/components/Logo/Logo.styled"
import { Skeleton } from "@/components/Skeleton"

import { LogoSize } from "./Logo"

export type LogoSkeletonProps = {
  size: LogoSize
}

export const LogoSkeleton: React.FC<LogoSkeletonProps> = ({ size }) => {
  return <Skeleton sx={{ size: LOGO_SIZES[size] }} circle />
}
