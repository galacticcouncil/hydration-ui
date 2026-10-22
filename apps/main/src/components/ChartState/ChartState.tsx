import Casette from "@galacticcouncil/ui/assets/images/Casette.webp"
import ChartError from "@galacticcouncil/ui/assets/images/ChartError.webp"
import {
  ChartSkeleton,
  ChartSkeletonProps,
  ChartStatus,
  Image,
  SpinnerIcon,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

export type ChartStateProps = {
  isLoading?: boolean
  isError?: boolean
  isEmpty: boolean
  children?: React.ReactNode
  className?: string
  variant?: ChartSkeletonProps["variant"]
}

export const ChartState: React.FC<ChartStateProps> = ({
  isLoading,
  isError,
  isEmpty,
  className,
  children,
  variant,
}) => {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <ChartSkeleton className={className} variant={variant}>
        <ChartStatus icon={<SpinnerIcon sx={{ opacity: 0.5 }} />} />
      </ChartSkeleton>
    )
  }

  if (isError) {
    return (
      <ChartSkeleton
        className={className}
        variant={variant}
        color={getToken("colors.skyBlue.700")}
      >
        <ChartStatus
          icon={
            <Image src={ChartError} width={75} height={75} alt="Chart error" />
          }
          message={t("chart.error")}
        />
      </ChartSkeleton>
    )
  }

  if (!isError && isEmpty) {
    return (
      <ChartSkeleton
        className={className}
        variant={variant}
        color={getToken("colors.skyBlue.700")}
      >
        <ChartStatus
          icon={
            <Image src={Casette} width={75} height={75} alt="Chart empty" />
          }
          message={t("chart.empty")}
        />
      </ChartSkeleton>
    )
  }

  return children
}
