import {
  Flex,
  Separator,
  SValueStatsValue,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

export const DashboardHeader = () => {
  const { t } = useTranslation(["common", "borrow"])

  return (
    <Flex direction={["column", "row"]} gap={[0, 40]}>
      <ValueStats
        label={t("borrow:netWorth")}
        value={t("common:currency", { value: 1000000 })}
        size="large"
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("borrow:netApy")}
        value={t("common:currency", { value: 1000000 })}
        size="large"
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("borrow:healthFactor")}
        customValue={
          <SValueStatsValue
            size="large"
            sx={{ color: getToken("accents.alert.primary") }}
          >
            1.35
          </SValueStatsValue>
        }
        size="large"
      />
    </Flex>
  )
}
