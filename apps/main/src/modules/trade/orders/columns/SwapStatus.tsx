import { Text } from "@galacticcouncil/ui/components"
import { px } from "@galacticcouncil/ui/utils"
import { ComponentProps, FC } from "react"
import { useTranslation } from "react-i18next"

export const SwapStatus: FC = () => {
  const { t } = useTranslation("trade")

  return <Status color="#AAEEFC">{t("trade.orders.status.filled")}</Status>
}

export const Status: FC<ComponentProps<typeof Text>> = (props) => {
  return <Text fw={500} fs={11} lh={px(15)} {...props} />
}
