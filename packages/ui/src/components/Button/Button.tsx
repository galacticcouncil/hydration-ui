import React, { FC } from "react"

import { BoxProps } from "@/components/Box"
import { SpinnerIcon } from "@/components/Spinner"

import {
  LoadingMode,
  MicroButtonVariant,
  SButton,
  SButtonIcon,
  SButtonProps,
  SButtonTransparent,
  SLoadingLabel,
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

export const ButtonTransparent: FC<ButtonProps> = (props) => {
  return <SButtonTransparent type="button" {...props} />
}

export const MicroButton: FC<MicroButtonProps> = (props) => (
  <SMicroButton as="button" type="button" {...props} />
)

export const ButtonIcon: FC<ButtonProps> = (props) => {
  return <SButtonIcon as="button" type="button" {...props} />
}

export type LoadingButtonProps = ButtonProps & {
  isLoading: boolean
  loadingVariant?: ButtonProps["variant"]
  loadingMode?: LoadingMode
}

export const LoadingButton: FC<LoadingButtonProps> = ({
  variant,
  loadingVariant = "tertiary",
  loadingMode = "inline",
  isLoading,
  children,
  ...props
}) => {
  return (
    <SButton
      as="button"
      type="button"
      aria-busy={isLoading}
      variant={isLoading && loadingVariant ? loadingVariant : variant}
      {...props}
    >
      <SLoadingLabel loadingMode={loadingMode}>
        <span data-loading-spinner>
          <SpinnerIcon size="1em" aria-hidden />
        </span>
        <span data-loading-content>{children}</span>
      </SLoadingLabel>
    </SButton>
  )
}
