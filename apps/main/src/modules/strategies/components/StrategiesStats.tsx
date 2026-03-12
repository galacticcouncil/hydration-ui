import { Stack, ValueStats } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

type Props = {
  totalDeposits: string
  activeBorrows: string
}

export const StrategiesStats = ({ totalDeposits, activeBorrows }: Props) => {
  const { t } = useTranslation("strategies")

  return (
    <Stack direction={["column", null, "row"]} justify="flex-start" gap={["base", null, "xxxl"]} separated>
      <ValueStats
        size="large"
        label={t("stats.totalDeposits")}
        value={totalDeposits}
      />
      <ValueStats
        size="large"
        label={t("stats.activeBorrows")}
        value={activeBorrows}
      />
    </Stack>
  )
}
