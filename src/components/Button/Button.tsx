import { ComponentProps, forwardRef } from "react"
import { SButton, SButtonTransparent, SContent } from "./Button.styled"
import { Spinner } from "components/Spinner/Spinner"

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "mutedSecondary"
  | "error"
  | "mutedError"
  | "warning"
  | "gradient"
  | "outline"
  | "transparent"
  | "blue"
  | "green"
export type ButtonSize = "small" | "medium" | "compact" | "micro"

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: React.ElementType
  variant?: ButtonVariant
  size?: ButtonSize
  text?: string
  isLoading?: boolean
  children?: React.ReactNode
  active?: boolean
  transform?: "uppercase" | "lowercase" | "none"
  fullWidth?: boolean
}

const spinnerSize: Record<ButtonSize, number> = {
  micro: 10,
  small: 12,
  medium: 16,
  compact: 16,
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "medium", ...props }, ref) => {
    return (
      <SButton variant={variant} size={size} {...props} ref={ref}>
        <SContent size={size}>
          {props.isLoading && <Spinner size={spinnerSize[size]} />}
          {props.text || props.children}
        </SContent>
      </SButton>
    )
  },
)

export const ButtonTransparent = forwardRef<
  HTMLButtonElement,
  ComponentProps<typeof SButtonTransparent>
>((props, ref) => {
  return <SButtonTransparent ref={ref} type="button" {...props} />
})
