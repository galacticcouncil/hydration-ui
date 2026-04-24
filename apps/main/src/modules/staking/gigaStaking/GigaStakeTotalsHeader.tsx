import { Stack, ValueStats } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export const GigaStakeTotalsHeader: FC = () => {
  const { t } = useTranslation(["common", "staking"])

  return (
    <Stack
      direction={["column", null, "row"]}
      justify="flex-start"
      gap={["base", null, "xxxl", "3.75rem"]}
      separated
    >
      <ValueStats
        wrap
        size="medium"
        label={t("staking:dashboard.projectedAPR")}
        isLoading={false}
        value={t("percent", { value: 10 })}
      />

      <ValueStats
        wrap
        size="medium"
        label={t("staking:gigaStake.header.lockdownPeriod")}
        isLoading={false}
        value={t("staking:gigaStake.header.valueDays", {
          value: 365,
        })}
      />
      <ValueStats
        wrap
        size="medium"
        label={t("staking:gigaStake.header.minimumLockPeriod")}
        isLoading={false}
        value={t("staking:gigaStake.header.valueDays", {
          value: 25,
        })}
      />
      <ValueStats
        wrap
        size="medium"
        label={t("staking:gigaStake.header.currentBorrowLimits")}
        isLoading={false}
        value={t("number", { value: 1000000 })}
      />
    </Stack>
  )
}
