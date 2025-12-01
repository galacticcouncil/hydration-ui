import { ArrowRightLong } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly fromAmount: string | null
  readonly from: TAsset
  readonly toAmount?: string | null
  readonly to: TAsset
  readonly showLogo?: boolean
}

export const SwapAmount = ({
  fromAmount,
  from,
  toAmount,
  to,
  showLogo,
}: Props) => {
  const { t } = useTranslation()

  return (
    <Flex gap={12} align="center">
      {showLogo && <AssetLogo id={from.id} size="small" />}
      <Flex gap={getTokenPx("scales.paddings.s")} align="center">
        <Text fw={500} fs={11} lh={1.4} color={getToken("text.high")}>
          {t("number", { value: fromAmount })}
        </Text>
        <Text
          fw={500}
          fs={11}
          lh={1.4}
          color={getToken("text.medium")}
          whiteSpace="nowrap"
        >
          {from.symbol}
        </Text>
      </Flex>
      <Icon
        size={16}
        component={ArrowRightLong}
        color={getToken("icons.onContainer")}
      />
      <Flex gap={getTokenPx("scales.paddings.s")} align="center">
        {showLogo && <AssetLogo id={to.id} size="small" />}
        {toAmount && (
          <Text fw={500} fs={11} lh={1.4} color={getToken("text.high")}>
            {t("number", { value: toAmount })}
          </Text>
        )}
        <Text fw={500} fs={11} lh={1.4} color={getToken("text.medium")}>
          {to.symbol}
        </Text>
      </Flex>
    </Flex>
  )
}
