import { Text } from 'components/Typography/Text/Text'
import { useTranslation } from 'react-i18next'

type Props = {
  percentage: number;
}

export const PieChartLabel = ({ percentage }: Props) => {
  const { t } = useTranslation()

  return (
    <>
      <Text fs={12}>{t("staking.dashboard.stats.chart.label")}</Text>
      <Text fs={30} font="FontOver">
        {percentage}%
      </Text>
    </>
  )
}
