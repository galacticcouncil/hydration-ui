import { Flex, ProgressBar, Text } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC } from "react"
import { useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { FillOrderFormValues } from "@/modules/trade/otc/fill-order/fillOrderSchema"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly assetIn: TAsset | undefined
  readonly assetInAmount: string
  readonly isPartiallyFillable: boolean
}

export const AvailableAmount: FC<Props> = ({
  assetIn,
  assetInAmount,
  isPartiallyFillable,
}) => {
  const { t } = useTranslation()
  const userSellAmount = useWatch<FillOrderFormValues>({
    name: "sellAmount",
  })

  const filledPct = new Big(userSellAmount || "0")
    .div(assetInAmount)
    .mul(100)
    .toNumber()

  return (
    <Flex
      direction="column"
      gap={8} // TODO px token containers/paddings/primary
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
          {assetInAmount} {assetIn?.symbol}
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
