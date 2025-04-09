import { FC } from "react"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

type Props = {
  readonly balanceToSell: string
  readonly percentage: number
}

export const RemoveDepositBalance: FC<Props> = ({
  balanceToSell,
  percentage,
}) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "column", align: "flex-end" }}>
      <Text fw={600} fs={24} lh="1" color="white">
        {t("value.token", {
          value: balanceToSell,
        })}
      </Text>
      <Text fw={126} fs={16} lh={"1.3"} color="pink500">
        {t("value.percentage", {
          value: percentage,
        })}
      </Text>
    </div>
  )
}
