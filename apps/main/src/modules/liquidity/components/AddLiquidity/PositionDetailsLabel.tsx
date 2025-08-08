import { Text } from "@galacticcouncil/ui/components/Text"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

export const PositionDetailsLabel = () => {
  const { t } = useTranslation("liquidity")

  return (
    <Text
      color={getToken("text.tint.secondary")}
      fw={500}
      font="primary"
      fs="h7"
      sx={{
        mt: getTokenPx("containers.paddings.primary"),
        mb: getTokenPx("containers.paddings.quart"),
      }}
    >
      {t("positionDetails")}
    </Text>
  )
}
