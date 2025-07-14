import { Flex, NumberInput, Text } from "@galacticcouncil/ui/components"
import {
  SliderTabs,
  SliderTabsOption,
} from "@galacticcouncil/ui/components/SliderTabs"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SettingLabel } from "@/modules/trade/swap/components/SettingsModal/SettingLabel"

type Props = {
  readonly slippage: number | null
  readonly onSlippageChange: (slippage: number | null) => void
  readonly helpTooltip?: string
  readonly description?: string
  readonly isError?: boolean
}

export const TradeSlippage: FC<Props> = ({
  slippage,
  onSlippageChange,
  helpTooltip,
  description,
  isError,
}) => {
  const { t } = useTranslation()

  return (
    <Flex direction="column" gap={getTokenPx("buttons.paddings.quart")}>
      <Flex
        justify="space-between"
        align="center"
        py={getTokenPx("scales.paddings.s")}
      >
        <SettingLabel label={t("slippage")} helpTooltip={helpTooltip} />
        <Flex gap={8} align="center">
          <SliderTabs
            options={slippageOptions}
            selected={
              slippageOptions.find((option) => option.id === slippage)?.id
            }
            onSelect={(option) => onSlippageChange(option.id)}
          />

          <NumberInput
            sx={{ width: 85 }}
            value={slippage}
            unit="%"
            placeholder={t("custom")}
            isError={isError}
            onValueChange={({ floatValue }) =>
              onSlippageChange(floatValue ?? null)
            }
          />
        </Flex>
      </Flex>
      {description && (
        <Text fs={12} lh={1.3} color={getToken("text.medium")}>
          {description}
        </Text>
      )}
    </Flex>
  )
}

const slippageOptions: ReadonlyArray<SliderTabsOption<number>> = [
  { id: 0.5, label: "0.5%" },
  { id: 1, label: "1%" },
  { id: 3, label: "3%" },
]
