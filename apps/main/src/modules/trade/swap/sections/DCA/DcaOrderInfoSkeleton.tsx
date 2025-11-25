import { Skeleton, Summary } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

export const DcaOrderInfoSkeleton: FC = () => {
  const { t } = useTranslation(["trade"])

  return (
    <Summary separator={<SwapSectionSeparator />} withTrailingSeparator>
      <SwapSummaryRow
        label={t("trade:dca.summary.orderFee")}
        content={<Skeleton sx={{ width: 150, marginLeft: "auto" }} />}
        tooltip={t("trade:dca.summary.orderFee.tooltip")}
      />
    </Summary>
  )
}
