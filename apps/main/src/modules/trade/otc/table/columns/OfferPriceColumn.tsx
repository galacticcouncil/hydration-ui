import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly offerPrice: string | null
  readonly nativePrice: string | null
  readonly assetInSymbol: string
  readonly assetOutSymbol: string
}

export const OfferPriceColumn: FC<Props> = ({
  offerPrice,
  nativePrice,
  assetInSymbol,
  assetOutSymbol,
}) => {
  const { t } = useTranslation("common")

  return (
    <Flex direction="column" align="center" gap={2}>
      {/* Native pair rate — primary: how much assetIn per 1 assetOut */}
      {nativePrice && (
        <Flex gap="xs" align="baseline">
          <Text fw={500} fs="p4" lh="xs" color={getToken("text.high")}>
            {t("number", { value: nativePrice })} {assetInSymbol}
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
      )}

      {/* USD anchor — secondary/muted */}
      {offerPrice && (
        <Flex gap="xs" align="baseline">
          <Text fw={500} fs="p6" lh="xs" color={getToken("text.low")}>
            ≈{" "}
            {t("currency", { value: offerPrice, maximumFractionDigits: null })}
          </Text>
          <Text
            fw={500}
            fs="p6"
            lh="xs"
            color={getToken("text.low")}
            whiteSpace="nowrap"
          >
            ({t("per")} {assetOutSymbol})
          </Text>
        </Flex>
      )}
    </Flex>
  )
}
