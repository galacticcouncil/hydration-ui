import Casette from "@galacticcouncil/ui/assets/images/Casette.webp"
import ChartError from "@galacticcouncil/ui/assets/images/ChartError.webp"
import {
  ChartSkeleton,
  ChartStatus,
  Image,
  Spinner,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

export type ChartStateProps = {
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  isEmpty: boolean
  children: React.ReactNode
  className?: string
}

export const ChartState: React.FC<ChartStateProps> = ({
  isLoading,
  isError,
  isSuccess,
  isEmpty,
  className,
  children,
}) => {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <ChartSkeleton className={className}>
        <ChartStatus icon={<Spinner />} />
      </ChartSkeleton>
    )
  }

  if (isError) {
    return (
      <ChartSkeleton
        className={className}
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

  if (isSuccess && isEmpty) {
    return (
      <ChartSkeleton
        className={className}
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
