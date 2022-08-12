import { MarginProps, SizeProps } from "common/styles"
import { ReactNode } from "react"
import { FC } from "react"
import { StyledIconWrapper } from "./Icon.styled"

export type IconProps = {
  children?: ReactNode
  size?: number
  icon?: ReactNode
} & SizeProps &
  MarginProps

export const Icon: FC<IconProps> = ({ children, icon, ...rest }) => {
  return <StyledIconWrapper {...rest}>{icon || children}</StyledIconWrapper>
}
