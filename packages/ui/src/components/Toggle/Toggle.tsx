import { forwardRef } from "react"

import { SThumb, SToggle, ToggleProps } from "./Toggle.styled"

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      checked = false,
      disabled,
      name,
      size = "medium",
      className,
      onCheckedChange,
      ...props
    },
    ref,
  ) => (
    <SToggle
      ref={ref}
      className={className}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      size={size}
      name={name}
      id={name}
      {...props}
    >
      <SThumb checked={checked} disabled={disabled} />
    </SToggle>
  ),
)

Toggle.displayName = "Toggle"
