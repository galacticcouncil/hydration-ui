import {
  Flex,
  FormError,
  NumberInput,
  Text,
} from "@galacticcouncil/ui/components"
import {
  SliderTabs,
  SliderTabsOption,
} from "@galacticcouncil/ui/components/SliderTabs"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SettingLabel } from "@/modules/trade/swap/components/SettingsModal/SettingLabel"

type Props = {
  readonly slippage: number | null
  readonly options?: ReadonlyArray<number>
  readonly helpTooltip?: string
  readonly description?: string
  readonly error?: string
  readonly onSlippageChange: (slippage: number | null) => void
}

export const TradeSlippage: FC<Props> = ({
  slippage,
  options = defaultSlippageOptions,
  helpTooltip,
  description,
  error,
  onSlippageChange,
}) => {
  const { t } = useTranslation()
  const isError = !!error

  const slippageOptions = Array.from(new Set(options).values()).map<
    SliderTabsOption<number>
  >((slippage) => ({
    id: slippage,
    label: t("percent", { value: slippage }),
  }))

  return (
    <Flex direction="column" gap="s">
      <Flex justify="space-between" align="center" py="s">
        <SettingLabel label={t("slippage")} helpTooltip={helpTooltip} />
        <Flex gap="base" align="center">
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
      {error && <FormError sx={{ textAlign: "end" }}>{error}</FormError>}
      {description && (
        <Text fs="p5" lh={1.3} color={getToken("text.medium")}>
          {description}
        </Text>
      )}
    </Flex>
  )
}

const defaultSlippageOptions: ReadonlyArray<number> = [0.5, 1, 3]
