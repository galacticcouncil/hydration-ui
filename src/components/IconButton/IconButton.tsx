import { noop } from "utils/helpers"
import { Icon } from "components/Icon/Icon"
import { FC, ReactNode } from "react"
import { SIconButton } from "./IconButton.styled"

export type IconButtonProps = {
  name?: string
  round?: boolean
  onClick?: () => void
  icon?: ReactNode
  size: number
}

export const IconButton: FC<IconButtonProps> = ({
  round = false,
  onClick = noop,
  icon,
  name,
  size = 34,
  ...rest
}) => (
  <SIconButton
    round={round}
    size={size}
    onClick={onClick}
    {...rest}
    aria-label={name}
  >
    <Icon icon={icon} />
  </SIconButton>
)
