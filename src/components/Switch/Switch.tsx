import { MarginProps } from "common/styles"
import { Label } from "components/Label/Label"
import { FC } from "react"
import { StyledSwitch, StyledThumb } from "./Switch.styled"

type SwitchProps = {
  value: boolean
  onCheckedChange: (v: boolean) => void
  label: string
  name: string
  disabled?: boolean
  size?: "small" | "regular"
  withLabel?: boolean
} & MarginProps

export const Switch: FC<SwitchProps> = ({
  value,
  onCheckedChange,
  disabled,
  size = "regular",
  name,
  label,
  withLabel = false,
}) => {
  return (
    <Label id={name} label={label} withLabel={withLabel} flex acenter fs={14}>
      <StyledSwitch
        checked={value}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        size={size}
        name={name}
        id={name}
        ml={withLabel ? 10 : 0}
      >
        <StyledThumb checked={value} disabled={disabled} size={size} />
      </StyledSwitch>
    </Label>
  )
}
