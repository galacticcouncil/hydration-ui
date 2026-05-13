import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly offerPrice: string | null
  readonly assetOutSymbol: string
}

export const OfferPriceColumn: FC<Props> = ({ offerPrice, assetOutSymbol }) => {
  const { t } = useTranslation("common")

  return (
    <Flex gap="xs">
      <Text fw={500} fs="p4" lh="xs" color={getToken("text.high")}>
        {t("currency.compact", { value: offerPrice, maximumFractionDigits: 4 })}
      </Text>
      <Text
        fw={500}
        fs="p4"
        lh="xs"
        color={getToken("text.low")}
        whiteSpace="nowrap"
      >
        ({t("per")} {assetOutSymbol})
      </Text>
    </Flex>
  )
}
