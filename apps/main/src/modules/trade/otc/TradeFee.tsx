import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly fee: string | undefined
  readonly feeSymbol: string
}

export const TradeFee: FC<Props> = ({ fee, feeSymbol }) => {
  const { t } = useTranslation()

  return (
    <Flex justify="space-between" align="center" my={4.5} px={20}>
      <Text fw={400} fs="p5" lh={px(16.8)} color={getToken("text.medium")}>
        {t("tradeFee")}
      </Text>
      <Text fw={500} fs="p5" lh={px(14.4)} color={getToken("text.high")}>
        {t("currency", {
          value: fee,
          symbol: feeSymbol,
          prefix: "=",
        })}
      </Text>
    </Flex>
  )
}
