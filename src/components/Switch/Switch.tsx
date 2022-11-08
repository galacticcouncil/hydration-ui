import { Label } from "components/Label/Label"
import { SSwitch, SThumb } from "./Switch.styled"

export type SwitchProps = {
  size?: "small" | "regular"
  value: boolean
  onCheckedChange: (v: boolean) => void
  label: string
  name: string
  disabled?: boolean
}

export const Switch = ({
  value,
  onCheckedChange,
  disabled,
  size = "regular",
  name,
  label,
}: SwitchProps) => (
  <Label
    id={name}
    label={label}
    withLabel={!!label}
    css={{
      fontSize: 14,
      display: "flex",
      alignItems: "center",
    }}
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
      <SThumb checked={value} disabled={disabled} size={size} />
    </SSwitch>
  </Label>
)
