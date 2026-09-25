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
  SLoadingButton,
  SLoadingLabel,
  SMicroButton,
} from "./Button.styled"
import { useLoadingState } from "./useLoadingState"

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
  loadingDelay?: number
  loadingFade?: boolean
}

export const LoadingButton: FC<LoadingButtonProps> = ({
  variant = "primary",
  loadingVariant = "muted",
  loadingMode = "inline",
  loadingDelay,
  loadingFade = false,
  isLoading,
  onClick,
  children,
  ...props
}) => {
  const isBusy = useLoadingState(isLoading, loadingDelay)

  return (
    <SLoadingButton
      as="button"
      type="button"
      aria-busy={isBusy}
      loadingFade={loadingFade}
      variant={isBusy && loadingVariant ? loadingVariant : variant}
      onClick={(e) => {
        if (isLoading || isBusy) return e.preventDefault()
        onClick?.(e)
      }}
      {...props}
    >
      <SLoadingLabel loadingMode={loadingMode}>
        <span data-loading-spinner>
          <SpinnerIcon size="1em" aria-hidden />
        </span>
        <span data-loading-content>{children}</span>
      </SLoadingLabel>
    </SLoadingButton>
  )
}
