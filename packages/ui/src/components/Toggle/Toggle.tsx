import { SThumb, SToggle, ToggleProps } from "./Toggle.styled"

export const Toggle = ({
  checked = false,
  disabled,
  name,
  size = "medium",
  className,
  onCheckedChange,
  ...props
}: ToggleProps) => {
  return (
    <SToggle
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
  )
}
