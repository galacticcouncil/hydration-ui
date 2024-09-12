import { Label } from "components/Label/Label"
import { SSwitch, SThumb } from "./Switch.styled"
import { ResponsiveValue } from "utils/responsive"

export type SwitchSize = "small" | "medium" | "large"
export type LabelPosition = "start" | "end"

export type SwitchProps = {
  size?: SwitchSize
  value: boolean
  onCheckedChange: (v: boolean) => void
  fs?: ResponsiveValue<number>
  label?: string
  labelPosition?: LabelPosition
  name: string
  disabled?: boolean
  className?: string
}

const getLabelPositionCss = (labelPosition: LabelPosition) => {
  if (labelPosition === "end") {
    return {
      "&>div:first-of-type": { order: 1 },
      button: { order: 0, marginRight: 10, marginLeft: 0 },
    }
  }
}

export const Switch = ({
  value,
  onCheckedChange,
  disabled,
  size = "medium",
  name,
  fs = 12,
  label,
  labelPosition = "start",
  className,
}: SwitchProps) => (
  <Label
    id={name}
    label={label ?? ""}
    withLabel={!!label}
    sx={{ fontSize: fs, flex: "row", align: "center" }}
    css={{ ...getLabelPositionCss(labelPosition), whiteSpace: "nowrap" }}
    className={className}
  >
    <SSwitch
      checked={value}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      size={size}
      name={name}
      id={name}
      withLabel={!!label}
    >
      <SThumb checked={value} disabled={disabled} />
    </SSwitch>
  </Label>
)
