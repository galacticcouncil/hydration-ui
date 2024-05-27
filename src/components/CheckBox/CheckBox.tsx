import React from "react"
import { SContainer, SOuter } from "./CheckBox.styled"

export type CheckboxSize = "small" | "medium" | "large"
export type CheckboxVariant = "primary" | "secondary"
export type CheckBoxProps = {
  className?: string
  label?: React.ReactNode
  checked?: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
  size?: CheckboxSize
  variant?: CheckboxVariant
}

export const CheckBox = ({
  checked,
  onChange,
  disabled,
  label,
  size = "medium",
  variant = "primary",
  className,
}: CheckBoxProps) => (
  <SContainer className={className}>
    <SOuter size={size} variant={variant}>
      <input
        type="checkbox"
        disabled={disabled}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span />
    </SOuter>
    {label}
  </SContainer>
)
