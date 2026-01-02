import React, { FC, ReactNode, Ref, useId } from "react"

import { getToken, px } from "@/utils"

import { Text } from "../Text"
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

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  CustomInputProps &
  LeadingElementProps &
  TrailingElementProps & {
    isError?: boolean
    className?: string
    ref?: Ref<HTMLInputElement>
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
  ...props
}) => {
  const inputId = useId()
  const usedInputId = id ?? inputId

  return (
    <SInputContainer
      variant={variant}
      customSize={customSize}
      className={className}
    >
      {leadingElement}
      {IconStart && <IconStart />}
      <SInput ref={ref} id={usedInputId} {...props} />
      {unit && (
        <Text
          fw={500}
          fs={11}
          lh={px(15)}
          color={getToken("buttons.secondary.low.onRest")}
          as="label"
          {...{ htmlFor: usedInputId }}
        >
          {unit}
        </Text>
      )}
      {IconEnd && <IconEnd />}
      {trailingElement}
    </SInputContainer>
  )
}
