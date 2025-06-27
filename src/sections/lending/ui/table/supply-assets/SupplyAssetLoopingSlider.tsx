import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "components/InfoTooltip/InfoTooltip.styled"
import { Slider } from "components/Slider/Slider"
import { Text } from "components/Typography/Text/Text"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { NewDepositFormValues } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.form"

export type SupplyAssetLoopingSliderProps = {
  className?: string
  max: number
}

export const SupplyAssetLoopingSlider: React.FC<
  SupplyAssetLoopingSliderProps
> = ({ className, max }) => {
  const { t } = useTranslation()

  const { control } = useFormContext<NewDepositFormValues>()

  const { field } = useController({
    control,
    name: "loopingMultiplier",
  })

  return (
    <div className={className}>
      <div sx={{ flex: "row", justify: "space-between", mb: 4 }}>
        <Text fs={14}>{t("lending.looping.slider.title")}</Text>
        <InfoTooltip text={t("lending.looping.slider.tooltip")}>
          <Text fs={14} sx={{ flex: "row", align: "center", gap: 4 }}>
            <span>
              {t("lending.looping.slider.value", {
                value: field.value,
              })}
            </span>
            <SInfoIcon />
          </Text>
        </InfoTooltip>
      </div>
      <Slider
        step={1}
        min={1}
        max={max}
        thumbSize="small"
        dashes="auto"
        withDashValues
        onChange={([value]) => field.onChange(value)}
        value={[field.value]}
        formatDashValue={(value) =>
          t("lending.looping.slider.value", { value })
        }
      />
    </div>
  )
}
