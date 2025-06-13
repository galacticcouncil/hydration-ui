import { Flex, Skeleton, Summary, Text } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

export const DcaSummarySkeleton: FC = () => {
  const { t } = useTranslation(["common", "trade"])

  return (
    <div>
      <Flex direction="column" gap={8} py={8}>
        <Text fw={500} fs={14} lh={px(22)} color={getToken("text.medium")}>
          {t("summary")}
        </Text>
        <Skeleton sx={{ width: "100%", height: 28 }} />
      </Flex>
      <SwapSectionSeparator />
      <Summary
        separator={<SwapSectionSeparator />}
        withTrailingSeparator
        rows={[
          {
            label: t("trade:market.summary.priceImpact"),
            content: <Skeleton sx={{ width: 150, marginLeft: "auto" }} />,
          },
        ]}
      />
    </div>
  )
}
