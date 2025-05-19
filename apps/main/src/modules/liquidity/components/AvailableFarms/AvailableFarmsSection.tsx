import { SectionHeader } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { AvailableFarms } from "./AvailableFarms"

const farms = [
  { id: 0, assetId: "5" },
  { id: 1, assetId: "0" },
]

export const AvailableFarmsSection = () => {
  const { t } = useTranslation("liquidity")

  if (farms.length === 0) return null

  return (
    <>
      <SectionHeader>{t("details.section.availableFarms")}</SectionHeader>
      <AvailableFarms
        farms={farms}
        sx={{ flexWrap: "wrap", flexDirection: "row" }}
      />
    </>
  )
}
