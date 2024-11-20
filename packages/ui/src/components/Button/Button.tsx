import React, { forwardRef } from "react"

import {
  SButton,
  SButtonLink,
  SButtonProps,
  SButtonTransparent,
} from "./Button.styled"

export type ButtonProps = SButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ type = "button", ...props }, ref) => (
    <SButton type={type} ref={ref} {...props} />
  ),
)

Button.displayName = "Button"

export type LinkButtonProps = React.ComponentPropsWithoutRef<"a"> & SButtonProps

export const ButtonLink = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (props, ref) => <SButtonLink ref={ref} {...props} />,
)

ButtonLink.displayName = "ButtonLink"

export const ButtonTransparent = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return <SButtonTransparent ref={ref} type="button" {...props} />
  },
)

ButtonTransparent.displayName = "ButtonTransparent"
