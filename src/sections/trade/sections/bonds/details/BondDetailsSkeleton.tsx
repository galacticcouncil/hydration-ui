import { BondsDetailsHeaderSkeleton } from "./BondDetailsData"
import { BondProgreesBar } from "./components/BondProgressBar/BondProgressBar"
import { Skeleton } from "sections/trade/sections/bonds/table/skeleton/Skeleton"
import { useTranslation } from "react-i18next"
import { BondsTrade } from "./components/BondTrade/BondsTradeApp"

export const BondDetailsSkeleton = () => {
  const { t } = useTranslation()

  const tableProps = {
    title: t("bonds.table.title"),
  }

  return (
    <div sx={{ flex: "column", gap: 40 }}>
      <BondsDetailsHeaderSkeleton />

      <BondsTrade />

      <BondProgreesBar />

      <Skeleton {...tableProps} />
    </div>
  )
}
