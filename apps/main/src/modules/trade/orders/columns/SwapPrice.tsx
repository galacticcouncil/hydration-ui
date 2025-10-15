import { Text } from "@galacticcouncil/ui/components"
import { Flex } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly from: TAsset
  readonly to: TAsset
  readonly price: string | null
}

export const SwapPrice: FC<Props> = ({ from, to, price }) => {
  const { t } = useTranslation()

  return (
    <Flex align="center" gap={4} justify="center">
      <Text fw={500} fs={11} lh={px(15)} color={getToken("text.high")}>
        {t("number", { value: price })}
      </Text>
      <Text fw={500} fs={11} lh={px(15)} color={getToken("text.medium")}>
        {from.symbol}/{to.symbol}
      </Text>
    </Flex>
  )
}
