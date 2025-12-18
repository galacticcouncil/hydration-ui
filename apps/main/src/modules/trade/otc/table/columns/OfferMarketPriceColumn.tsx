import { Text } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly percentage: number | null
}

export const OfferMarketPriceColumn: FC<Props> = ({ percentage }) => {
  const { t } = useTranslation()
  const { isMobile } = useBreakpoints()

  const percentageNum = Number(percentage)

  return (
    <Text
      fw={500}
      fs={13}
      lh={1}
      color={
        percentageNum < 0
          ? getToken("details.values.positive")
          : percentageNum > 0 && getToken("details.values.negative")
      }
      truncate
    >
      {percentageNum < 0 && "-"}
      {percentageNum > 0 && "+"}
      {t(isMobile ? "percent.compact" : "percent", {
        value: percentage === null ? null : Math.abs(percentage),
      })}
    </Text>
  )
}
