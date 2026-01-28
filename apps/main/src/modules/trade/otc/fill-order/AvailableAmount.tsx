import { Flex, ProgressBar, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly assetIn: TAsset | undefined
  readonly assetInAmount: string
  readonly userSellAmount: string
  readonly isPartiallyFillable: boolean
}

export const AvailableAmount: FC<Props> = ({
  assetIn,
  assetInAmount,
  userSellAmount,
  isPartiallyFillable,
}) => {
  const { t } = useTranslation()

  const filledPct = new Big(userSellAmount || "0")
    .div(assetInAmount)
    .mul(100)
    .toNumber()

  return (
    <Flex
      direction="column"
      gap="base"
      p="xxl"
      bg={getToken("details.separatorsOnDim")}
    >
      <Flex justify="space-between" align="center">
        {isPartiallyFillable && (
          <Text fw={400} lh="m" fs="p3" color={getToken("text.medium")}>
            {t("availableAmount")}:
          </Text>
        )}
        <Text
          fw={600}
          fs="p1"
          lh="l"
          color={getToken("buttons.primary.medium.rest")}
        >
          {t("currency", { value: assetInAmount, symbol: assetIn?.symbol })}
        </Text>
      </Flex>
      {isPartiallyFillable && (
        <ProgressBar
          size="medium"
          value={filledPct}
          format={(percentage) => t("percent", { value: percentage })}
        />
      )}
    </Flex>
  )
}
