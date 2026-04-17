import { Text } from "@galacticcouncil/ui/components"
import { Flex } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly from: TAsset
  readonly to: TAsset
  readonly price: string | null
}

export const SwapPrice: FC<Props> = ({ from, to, price }) => {
  const { t } = useTranslation("common")
  const [inverted, setInverted] = useState(false)

  if (!price)
    return (
      <Text fw={500} fs="p6" lh="s" color={getToken("text.high")}>
        -
      </Text>
    )

  const displayedPrice = inverted ? Big(1).div(price).toString() : price
  const displayedPriceSymbol = inverted
    ? `${to.symbol}/${from.symbol}`
    : `${from.symbol}/${to.symbol}`

  return (
    <Flex
      as="button"
      align="center"
      gap="s"
      justify="center"
      onClick={(e) => {
        e.stopPropagation()
        setInverted(!inverted)
      }}
      sx={{
        "&:hover": {
          opacity: 0.7,
        },
      }}
    >
      <Text fw={500} fs="p6" lh="s" color={getToken("text.high")}>
        {t("number", { value: displayedPrice })}
      </Text>
      <Text fw={500} fs="p6" lh="s" color={getToken("text.medium")}>
        {displayedPriceSymbol}
      </Text>
    </Flex>
  )
}
