import { Flex, Input, Text } from "@galacticcouncil/ui/components"
import {
  SliderTabs,
  SliderTabsOption,
} from "@galacticcouncil/ui/components/SliderTabs"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SettingLabel } from "@/modules/trade/components/SettingsModal/SettingLabel"

type Props = {
  readonly slippage: number
  readonly onSlippageChange: (slippage: number) => void
  readonly helpTooltip?: string
  readonly description?: string
}

export const TradeSlippage: FC<Props> = ({
  slippage,
  onSlippageChange,
  helpTooltip,
  description,
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
              slippageOptions.find((option) => option.value === slippage)?.id
            }
            onSelect={(option) => onSlippageChange(option.value)}
          />

          <Input
            sx={{ width: 85 }}
            value={slippage}
            unit="%"
            placeholder={t("custom")}
            onChange={(e) => {
              const value = Number(e.target.value)

              if (!isNaN(value)) {
                onSlippageChange(value)
              }
            }}
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
  { id: "0.5", value: 0.5, label: "0.5%" },
  { id: "1", value: 1, label: "1%" },
  { id: "3", value: 3, label: "3%" },
]
