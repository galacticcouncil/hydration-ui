import { Flex, ProgressBar, Text } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
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
      gap={8}
      py={20}
      px={20}
      bg={getToken("details.separatorsOnDim")}
    >
      <Flex
        justify="space-between"
        align="center"
        color={getToken("buttons.primary.medium.rest")}
      >
        <Text fw={400} fs="p3" lh={px(19.6)}>
          {t("availableAmount")}:
        </Text>
        <Text fw={600} fs={16} lh={1}>
          {t("currency", { value: assetInAmount, symbol: assetIn?.symbol })}
        </Text>
      </Flex>
      {isPartiallyFillable && (
        <ProgressBar
          size="medium"
          value={filledPct}
          format={(percentage) => `${Math.floor(percentage).toString()}%`}
        />
      )}
    </Flex>
  )
}
