import { TradeOperation } from "@galacticcouncil/indexer/squid"
import { Text } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly type: TradeOperation
}

export const TransactionType: FC<Props> = ({ type }) => {
  const { t } = useTranslation()

  const types: Partial<Record<TradeOperation, string>> = {
    [TradeOperation.ExactIn]: t("sell"),
    [TradeOperation.ExactOut]: t("buy"),
  }

  return (
    <Text
      fw={500}
      fs={12}
      lh={px(15)}
      color={
        type === TradeOperation.ExactOut
          ? getToken("accents.success.emphasis")
          : getToken("alarmRed.500")
      }
      transform="capitalize"
    >
      {types[type] ?? t("unknown")}
    </Text>
  )
}
