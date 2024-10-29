import React, { forwardRef } from "react"

import { SButton, SButtonProps, SLinkButton } from "./Button.styled"

export type ButtonProps = SButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ type = "button", ...props }) => <SButton type={type} {...props} />,
)

Button.displayName = "Button"

export type LinkButtonProps = React.ComponentPropsWithoutRef<"a"> & SButtonProps

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (props, ref) => <SLinkButton ref={ref} {...props} />,
)

LinkButton.displayName = "LinkButton"
