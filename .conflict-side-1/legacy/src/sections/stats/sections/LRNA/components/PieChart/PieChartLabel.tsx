import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

export const PieChartLabel = () => {
  const { t } = useTranslation()

  return (
    <>
      <Text fs={12}>status:</Text>
      <Text fs={20} font="GeistMono">
        {t("stats.lrna.status.burning")}
      </Text>
    </>
  )
}
