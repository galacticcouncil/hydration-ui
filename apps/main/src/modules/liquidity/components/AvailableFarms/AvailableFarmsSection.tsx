import { SectionHeader } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import {
  IsolatedPoolTable,
  OmnipoolAssetTable,
} from "@/modules/liquidity/Liquidity.utils"

import { AvailableFarms } from "./AvailableFarms"

export const AvailableFarmsSection = ({
  data,
}: {
  data: OmnipoolAssetTable | IsolatedPoolTable
}) => {
  const { t } = useTranslation("liquidity")

  if (data.farms.length === 0) return null

  return (
    <>
      <SectionHeader>{t("details.section.availableFarms")}</SectionHeader>
      <AvailableFarms
        farms={data.farms}
        sx={{ flexWrap: "wrap", flexDirection: "row" }}
      />
    </>
  )
}
