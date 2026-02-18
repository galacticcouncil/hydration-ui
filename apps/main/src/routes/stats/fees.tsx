import { SectionHeader } from "@galacticcouncil/ui/components"
import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { StatsFees } from "@/modules/stats/fees/StatsFees"

function FeesStats() {
  const { t } = useTranslation("stats")

  return (
    <>
      <SectionHeader title={t("fees.title")} noTopPadding />
      <StatsFees />
    </>
  )
}

export const Route = createFileRoute("/stats/fees")({
  component: FeesStats,
})
