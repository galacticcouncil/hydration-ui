import {
  Flex,
  Skeleton,
  Summary,
  SummaryRowLabel,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

export const DcaSummarySkeleton: FC = () => {
  const { t } = useTranslation(["common", "trade"])

  return (
    <div>
      <Flex direction="column" gap={8} py={8}>
        <SummaryRowLabel>{t("summary")}</SummaryRowLabel>
        <Skeleton sx={{ width: "100%", height: 13 }} />
      </Flex>
      <SwapSectionSeparator sx={{ mt: 9 }} />
      <Summary separator={<SwapSectionSeparator />} withTrailingSeparator>
        <SwapSummaryRow
          label={t("trade:dca.summary.scheduleEnd")}
          content={<Skeleton sx={{ width: 150, marginLeft: "auto" }} />}
        />
        <SwapSummaryRow
          label={t("trade:dca.summary.slippage")}
          content={<Skeleton sx={{ width: 150, marginLeft: "auto" }} />}
        />
      </Summary>
    </div>
  )
}
