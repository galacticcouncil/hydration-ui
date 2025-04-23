import { ReactNode } from "react"
import { FC } from "react"
import { SIconWrapper } from "./Icon.styled"
import { ResponsiveValue } from "utils/responsive"

export type IconProps = {
  children?: ReactNode
  size?: ResponsiveValue<number>
  icon?: ReactNode
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
}

export const Icon: FC<IconProps> = ({ children, icon, ...rest }) => {
  return <SIconWrapper {...rest}>{icon || children}</SIconWrapper>
}
