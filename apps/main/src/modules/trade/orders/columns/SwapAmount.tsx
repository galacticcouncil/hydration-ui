import { ArrowRight } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly fromAmount: string
  readonly from: TAsset
  readonly toAmount: string
  readonly to: TAsset
}

export const SwapAmount = ({ fromAmount, from, toAmount, to }: Props) => {
  const { t } = useTranslation()

  return (
    <Flex gap={12} align="center">
      <Flex gap={2} align="center">
        <Text fw={500} fs={11} lh={1.4} color={getToken("text.high")}>
          {t("number", { value: fromAmount })}
        </Text>
        <Text fw={500} fs={11} lh={1.4} color={getToken("text.medium")}>
          {from.symbol}
        </Text>
      </Flex>
      <Icon
        size={12}
        component={ArrowRight}
        color={getToken("icons.onContainer")}
      />
      <Flex gap={2} align="center">
        <Text fw={500} fs={11} lh={1.4} color={getToken("text.high")}>
          {t("number", { value: toAmount })}
        </Text>
        <Text fw={500} fs={11} lh={1.4} color={getToken("text.medium")}>
          {to.symbol}
        </Text>
      </Flex>
    </Flex>
  )
}
