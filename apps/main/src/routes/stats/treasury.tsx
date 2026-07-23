import { SectionHeader } from "@galacticcouncil/ui/components"
import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { StatsTreasury } from "@/modules/stats/treasury/StatsTreasury"

function TreasuryStats() {
  const { t } = useTranslation("stats")

  return (
    <>
      <SectionHeader title={t("treasury.title")} noTopPadding />
      <StatsTreasury />
    </>
  )
}

export const Route = createFileRoute("/stats/treasury")({
  component: TreasuryStats,
})
