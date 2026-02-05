import { FC, Ref } from "react"

import { Flex, FlexProps } from "@/components/Flex"
import { Text, TextProps } from "@/components/Text"
import { getToken } from "@/utils"

import { SThumb, SToggle, ToggleProps } from "./Toggle.styled"

export const ToggleRoot: FC<FlexProps> = ({ children, ...props }) => {
  return (
    <Flex gap="base" align="center" {...props}>
      {children}
    </Flex>
  )
}

export const Toggle: FC<ToggleProps & { ref?: Ref<HTMLButtonElement> }> = ({
  checked = false,
  disabled,
  name,
  size = "medium",
  className,
  onCheckedChange,
  ref,
  ...props
}) => (
  <SToggle
    ref={ref}
    className={className}
    checked={checked}
    onCheckedChange={onCheckedChange}
    disabled={disabled}
    size={size}
    name={name}
    id={name}
    {...props}
  >
    <SThumb checked={checked} disabled={disabled} />
  </SToggle>
)

export const ToggleLabel: FC<
  TextProps & { ref?: Ref<HTMLParagraphElement> }
> = ({ ref, ...props }) => {
  return (
    <Text
      ref={ref}
      fw={500}
      fs="p5"
      lh="s"
      color={getToken("text.high")}
      whiteSpace="nowrap"
      {...props}
    />
  )
}
