import { ReactNode } from "react"
import { FC } from "react"
import { SIconWrapper } from "./Icon.styled"

export type IconProps = {
  children?: ReactNode
  size?: number
  icon?: ReactNode
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
}

export const Icon: FC<IconProps> = ({ children, icon, ...rest }) => {
  return <SIconWrapper {...rest}>{icon || children}</SIconWrapper>
}
