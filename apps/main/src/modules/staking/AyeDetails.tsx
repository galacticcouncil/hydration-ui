import { Flex, Text, TextProps } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly label?: string
  readonly value?: string
  readonly percent: number
  readonly labelProps?: Partial<TextProps>
}

export const AyeDetails: FC<Props> = ({
  label,
  labelProps,
  value,
  percent,
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
        color={getToken("surfaces.containers.low.onPrimary")}
      >
        {value ? (
          <>
            {t("currency", { value, symbol: native.symbol })}(
            {t("percent", { value: percent })})
          </>
        ) : (
          t("percent", { value: percent })
        )}
      </Text>
    </Flex>
  )
}
