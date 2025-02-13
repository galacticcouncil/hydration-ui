import React, { forwardRef } from "react"

import { BoxProps } from "@/components/Box"

import {
  MicroButtonVariant,
  SButton,
  SButtonProps,
  SButtonTransparent,
  SMicroButton,
} from "./Button.styled"

type ButtonOwnProps = {
  iconStart?: React.ComponentType
  iconEnd?: React.ComponentType
}

export type ButtonProps = BoxProps &
  ButtonOwnProps &
  SButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>

export type MicroButtonProps = BoxProps & {
  variant?: MicroButtonVariant
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, iconStart: IconStart, iconEnd: IconEnd, ...props }, ref) => {
    return (
      <SButton as="button" type="button" ref={ref} {...props}>
        {props.asChild ? (
          children
        ) : (
          <>
            {IconStart && <IconStart />}
            {children}
            {IconEnd && <IconEnd />}
          </>
        )}
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
