import { MarginProps, SizeProps } from "utils/styles"
import { Link } from "components/Link/Link"
import { FC, ReactNode, SyntheticEvent } from "react"
import { SButton } from "./Button.styled"

export type ButtonProps = {
  variant?: "primary" | "secondary" | "gradient"
  disabled?: boolean
  text?: string
  to?: string
  type?: "button" | "submit" | "reset"
  icon?: SVGElement
  onClick?: (e: SyntheticEvent) => void
  size?: "small" | "medium" | "micro"
  fullWidth?: boolean
  capitalize?: boolean
  children?: ReactNode
  className?: string
} & SizeProps &
  MarginProps

export const Button: FC<ButtonProps> = ({
  type = "button",
  variant = "secondary",
  size = "medium",
  ...props
}) => {
  const element = (
    <SButton {...props} type={type} variant={variant} size={size}>
      {props.text || props.children}
    </SButton>
  )
  if (props.to) return <Link to={props.to}>{element}</Link>
  return element
}
