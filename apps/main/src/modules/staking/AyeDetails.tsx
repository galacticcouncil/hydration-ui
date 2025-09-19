import { Flex, Text, TextProps } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly label?: string
  readonly labelProps?: Partial<TextProps>
  readonly value?: string
  readonly percent: number
  readonly percentProps?: Partial<TextProps>
  readonly voted: boolean
}

export const AyeDetails: FC<Props> = ({
  label,
  labelProps,
  value,
  percent,
  percentProps,
  voted,
}) => {
  const { t } = useTranslation(["common"])
  const { native } = useAssets()

  return (
    <Flex direction="column" gap={5}>
      {label && (
        <Text fw={500} fs={13} lh={1} {...labelProps}>
          {label}
        </Text>
      )}
      <Text
        fw={500}
        fs="p6"
        lh={1}
        color={
          voted
            ? getToken("text.medium")
            : getToken("surfaces.containers.low.onPrimary")
        }
        {...percentProps}
      >
        {value ? (
          <>
            {t("currency.compact", { value, symbol: native.symbol })}(
            {t("percent", { value: percent })})
          </>
        ) : (
          t("percent", { value: percent })
        )}
      </Text>
    </Flex>
  )
}
