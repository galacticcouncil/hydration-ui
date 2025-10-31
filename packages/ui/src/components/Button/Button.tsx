import React, { FC } from "react"

import { BoxProps } from "@/components/Box"
import { Spinner } from "@/components/Spinner"

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
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    ref?: React.Ref<HTMLButtonElement>
  }

export type MicroButtonProps = BoxProps & {
  variant?: MicroButtonVariant
  ref?: React.Ref<HTMLButtonElement>
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const Button: FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <SButton
      as="button"
      type="button"
      {...props}
      outline={
        props.variant === "sliderTabInactive" ||
        (props.variant !== "sliderTabActive" && !!props.outline)
      }
    >
      {children}
    </SButton>
  )
}

export const LoadingButton: FC<
  ButtonProps & { isLoading: boolean; loadingVariant?: ButtonProps["variant"] }
> = ({ variant, loadingVariant = "tertiary", isLoading, ...props }) => {
  return (
    <SButton
      as="button"
      variant={isLoading && loadingVariant ? loadingVariant : variant}
      {...props}
    >
      {isLoading && <Spinner sx={{ mr: 4 }} />}
      {props.children}
    </SButton>
  )
}

export const ButtonTransparent: FC<ButtonProps> = (props) => {
  return <SButtonTransparent type="button" {...props} />
}

export const MicroButton: FC<MicroButtonProps> = (props) => (
  <SMicroButton as="button" type="button" {...props} />
)

export const ButtonIcon: FC<ButtonProps> = (props) => {
  return <SButtonIcon type="button" {...props} />
}
