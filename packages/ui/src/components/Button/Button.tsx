import { Slottable } from "@radix-ui/react-slot"
import React, { FC } from "react"

import { BoxProps } from "@/components/Box"
import { Icon } from "@/components/Icon"
import { SpinnerIcon } from "@/components/Spinner"

import {
  LoadingMode,
  SButton,
  SButtonProps,
  SButtonTransparent,
  SLoadingButton,
  SLoadingLabel,
} from "./Button.styled"
import { useLoadingState } from "./useLoadingState"

type ButtonIconProps = {
  /** Renders a square button holding only this icon. */
  icon?: React.ComponentType
  iconStart?: React.ComponentType
  iconEnd?: React.ComponentType
}

export type ButtonProps = BoxProps &
  SButtonProps &
  ButtonIconProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    ref?: React.Ref<HTMLButtonElement>
  }

// only an icon next to a label gets a side, which shifts it towards that edge
const buttonIcon = (
  component: React.ComponentType | undefined,
  side?: "start" | "end",
) => component && <Icon component={component} data-icon={side} />

export const Button: FC<ButtonProps> = ({
  icon,
  iconStart,
  iconEnd,
  children,
  ...props
}) => {
  const hasLabel = !icon && React.Children.count(children) > 0

  return (
    <SButton
      as="button"
      type="button"
      data-icon-only={icon ? "" : undefined}
      {...props}
    >
      {buttonIcon(icon ?? iconStart, hasLabel ? "start" : undefined)}
      <Slottable>{children}</Slottable>
      {!icon && buttonIcon(iconEnd, hasLabel ? "end" : undefined)}
    </SButton>
  )
}

export const ButtonTransparent: FC<ButtonProps> = (props) => {
  return <SButtonTransparent type="button" {...props} />
}

export type LoadingButtonProps = Omit<ButtonProps, "icon"> & {
  isLoading: boolean
  loadingVariant?: ButtonProps["variant"]
  disabledVariant?: ButtonProps["variant"]
  loadingMode?: LoadingMode
  loadingDelay?: number
  loadingFade?: boolean
}

export const LoadingButton: FC<LoadingButtonProps> = ({
  variant = "primary",
  loadingVariant = "muted",
  disabledVariant,
  loadingMode = "inline",
  loadingDelay,
  loadingFade = false,
  isLoading,
  onClick,
  iconStart,
  iconEnd,
  children,
  ...props
}) => {
  const isBusy = useLoadingState(isLoading, loadingDelay)
  const restVariant =
    props.disabled && disabledVariant ? disabledVariant : variant

  return (
    <SLoadingButton
      as="button"
      type="button"
      aria-busy={isBusy}
      loadingFade={loadingFade}
      disabledFade={!disabledVariant || disabledVariant === variant}
      variant={isBusy && loadingVariant ? loadingVariant : restVariant}
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
        <span data-loading-content>
          {buttonIcon(iconStart, "start")}
          {children}
          {buttonIcon(iconEnd, "end")}
        </span>
      </SLoadingLabel>
    </SLoadingButton>
  )
}
