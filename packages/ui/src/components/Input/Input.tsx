import React, { FC, ReactNode, Ref, useId } from "react"

import { Label } from "@/components/Label"
import { getToken } from "@/utils"

import { CustomInputProps, SInput, SInputContainer } from "./Input.styled"

type LeadingElementProps =
  | {
      iconStart?: React.ComponentType
      leadingElement?: never
    }
  | {
      iconStart?: never
      leadingElement?: ReactNode
    }

type TrailingElementProps =
  | {
      unit?: string
      iconEnd?: React.ComponentType
      trailingElement?: never
    }
  | {
      unit?: never
      iconEnd?: never
      trailingElement?: ReactNode
    }

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "width"
> &
  CustomInputProps &
  LeadingElementProps &
  TrailingElementProps & {
    isError?: boolean
    className?: string
    ref?: Ref<HTMLInputElement>
    width?: string | number | Array<string | number | null>
  }

export const Input: FC<InputProps> = ({
  iconStart: IconStart,
  iconEnd: IconEnd,
  unit,
  leadingElement,
  trailingElement,
  variant,
  customSize,
  className,
  ref,
  id,
  width,
  autoComplete = "off",
  ...props
}) => {
  const inputId = useId()
  const usedInputId = id ?? inputId

  return (
    <SInputContainer
      variant={variant}
      customSize={customSize}
      className={className}
      sx={{ width }}
    >
      {leadingElement}
      {IconStart && <IconStart />}
      <SInput
        ref={ref}
        id={usedInputId}
        autoComplete={autoComplete}
        {...props}
      />
      {unit && (
        <Label
          sx={{ cursor: "text" }}
          htmlFor={usedInputId}
          fw={500}
          fs="p6"
          lh="s"
          color={getToken("buttons.secondary.low.onRest")}
        >
          {unit}
        </Label>
      )}
      {IconEnd && <IconEnd />}
      {trailingElement}
    </SInputContainer>
  )
}
