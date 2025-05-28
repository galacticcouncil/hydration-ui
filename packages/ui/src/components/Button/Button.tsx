import React, { forwardRef } from "react"

import { BoxProps } from "@/components/Box"

import {
  MicroButtonVariant,
  SButton,
  SButtonIcon,
  SButtonProps,
  SButtonTransparent,
  SMicroButton,
} from "./Button.styled"

export type ButtonProps = BoxProps &
  SButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>

export type MicroButtonProps = BoxProps & {
  variant?: MicroButtonVariant
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <SButton
        as="button"
        type="button"
        ref={ref}
        {...props}
        outline={
          props.variant === "sliderTabInactive" ||
          (props.variant !== "sliderTabActive" && !!props.outline)
        }
      >
        {children}
      </SButton>
    )
  },
)

Button.displayName = "Button"

export const ButtonTransparent = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return <SButtonTransparent type="button" ref={ref} {...props} />
  },
)

ButtonTransparent.displayName = "ButtonTransparent"

export const MicroButton = forwardRef<HTMLButtonElement, MicroButtonProps>(
  (props, ref) => (
    <SMicroButton as="button" type="button" ref={ref} {...props} />
  ),
)

MicroButton.displayName = "MicroButton"

export const ButtonIcon = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return <SButtonIcon type="button" ref={ref} {...props} />
  },
)

ButtonIcon.displayName = "ButtonIcon"
