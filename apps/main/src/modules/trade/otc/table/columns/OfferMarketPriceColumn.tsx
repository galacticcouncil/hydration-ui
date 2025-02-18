import { Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly percentage: number | null
}

export const OfferMarketPriceColumn: FC<Props> = ({ percentage }) => {
  const { t } = useTranslation()
  const percentageNum = Number(percentage)

  return (
    <Text
      fw={500}
      fs={13}
      lh={1}
      color={
        percentageNum > 0
          ? getToken("details.values.positive")
          : percentageNum < 0 && getToken("details.values.negative")
      }
      sx={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
      }}
    >
      {t("percent", { value: percentage })}
    </Text>
  )
}
