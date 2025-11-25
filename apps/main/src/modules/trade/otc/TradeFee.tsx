import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly fee: string | undefined
  readonly feeDisplay: string
  readonly feePct: string
  readonly feeSymbol: string
}

export const TradeFee: FC<Props> = ({ fee, feeDisplay, feePct, feeSymbol }) => {
  const { t } = useTranslation(["common", "trade"])

  return (
    <Flex justify="space-between" align="center" my={4.5} px={20}>
      <Text fw={400} fs="p5" lh={px(16.8)} color={getToken("text.medium")}>
        {t("trade:otc.fillOrder.tradeFee", {
          percentage: Big(feePct).times(100).toNumber(),
        })}
      </Text>
      <Text fw={500} fs="p5" lh={px(14.4)} color={getToken("text.high")}>
        {t("currency", {
          value: fee,
          symbol: feeSymbol,
          prefix: "=",
        })}
        {fee && <> ({feeDisplay})</>}
      </Text>
    </Flex>
  )
}
