import { Box, Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export const PastExecutionsHeader: FC = () => {
  const { t } = useTranslation("trade")

  return (
    <Box
      py={getTokenPx("containers.paddings.primary")}
      px={getTokenPx("containers.paddings.secondary")}
    >
      <Text fw={500} fs={14} lh={px(15)} color={getToken("text.high")}>
        {t("trade.orders.pastExecutions.title")}
      </Text>
    </Box>
  )
}
