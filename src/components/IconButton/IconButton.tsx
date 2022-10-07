import { noop } from "utils/helpers"
import { Icon } from "components/Icon/Icon"
import { FC, ReactNode } from "react"
import { SIconButton } from "./IconButton.styled"

export type IconButtonProps = {
  name: string
  round?: boolean
  onClick?: () => void
  icon?: ReactNode
}

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
