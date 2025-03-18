import { ChartSkeleton } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

export type ChartStateProps = {
  height?: number
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  isEmpty: boolean
  children: React.ReactNode
}

export const ChartState: React.FC<ChartStateProps> = ({
  isLoading,
  isError,
  isSuccess,
  isEmpty,
  height,
  children,
}) => {
  const { t } = useTranslation()

  if (isLoading) {
    return <ChartSkeleton type="loading" height={height} />
  }

  if (isError) {
    return (
      <ChartSkeleton
        type="error"
        height={height}
        message={t("error.chartError")}
      />
    )
  }

  if (isSuccess && isEmpty) {
    return (
      <ChartSkeleton
        type="empty"
        height={height}
        message={t("error.chartEmpty")}
      />
    )
  }

  return children
}
