import { Separator, Stack, ValueStats } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

export const ReserveHeader = () => {
  const { t } = useTranslation(["common", "borrow"])
  return (
    <Stack direction={["column", "row"]} separated gap={[0, 40]}>
      <ValueStats
        label={"Reserve size"}
        value={t("common:currency", { value: 1000000 })}
        size="large"
      />
      <ValueStats
        label={"Available Liquidity"}
        value={t("common:currency", { value: 1000000 })}
        size="large"
      />
      <ValueStats label={"Available Liquidity"} value="83.13%" size="large" />
      <ValueStats
        label={"Oracle Price"}
        value={t("common:currency", { value: 123.45 })}
        size="large"
      />
    </Stack>
  )
}
