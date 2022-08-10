import { noop } from "common/helpers"
import { ColorProps, MarginProps, SizeProps } from "common/styles"
import { Icon } from "components/Icon/Icon"
import { FC, ReactNode } from "react"
import { StyledIconButton } from "./IconButton.styled"

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
  <StyledIconButton round={round} onClick={onClick} {...rest} aria-label={name}>
    <Icon icon={icon} />
  </StyledIconButton>
)
