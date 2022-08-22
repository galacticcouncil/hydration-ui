import { noop } from "utils/helpers"
import { ColorProps, MarginProps, SizeProps } from "utils/styles"
import { Icon } from "components/Icon/Icon"
import { FC, ReactNode } from "react"
import { SIconButton } from "./IconButton.styled"

export type IconButtonProps = {
  name: string
  round?: boolean
  onClick?: () => void
  icon?: ReactNode
} & SizeProps &
  ColorProps &
  MarginProps

export const IconButton: FC<IconButtonProps> = ({
  round = true,
  onClick = noop,
  icon,
  name,
  ...rest
}) => (
  <SIconButton round={round} onClick={onClick} {...rest} aria-label={name}>
    <Icon icon={icon} />
  </SIconButton>
)
