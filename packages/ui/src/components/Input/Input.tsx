import { forwardRef } from "react"

import { CustomInputProps, SInput } from "./Input.styled"
export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  CustomInputProps

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ ...props }, ref) => <SInput ref={ref} {...props} />,
)

Input.displayName = "Input"
