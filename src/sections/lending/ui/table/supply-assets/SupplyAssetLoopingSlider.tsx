import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "components/InfoTooltip/InfoTooltip.styled"
import { Slider } from "components/Slider/Slider"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

export type SupplyAssetLoopingSliderProps = {
  value: number
  onChange: (value: number) => void
  className?: string
}

const LOOPING_MULTIPLIER_MIN = 1
const LOOPING_MULTIPLIER_MAX = 8

export const SupplyAssetLoopingSlider: React.FC<
  SupplyAssetLoopingSliderProps
> = ({ value, onChange, className }) => {
  const { t } = useTranslation()
  return (
    <div className={className}>
      <div sx={{ flex: "row", justify: "space-between", mb: 4 }}>
        <Text fs={14}>{t("lending.looping.slider.title")}</Text>
        <InfoTooltip text={t("lending.looping.slider.tooltip")}>
          <Text fs={14} sx={{ flex: "row", align: "center", gap: 4 }}>
            <span>
              {t("lending.looping.slider.value", {
                value,
              })}
            </span>
            <SInfoIcon />
          </Text>
        </InfoTooltip>
      </div>
      <Slider
        step={1}
        min={LOOPING_MULTIPLIER_MIN}
        max={LOOPING_MULTIPLIER_MAX}
        thumbSize="small"
        dashes="auto"
        withDashValues
        onChange={([value]) => onChange(value)}
        value={[value]}
        formatDashValue={(value) =>
          t("lending.looping.slider.value", { value })
        }
      />
    </div>
  )
}
