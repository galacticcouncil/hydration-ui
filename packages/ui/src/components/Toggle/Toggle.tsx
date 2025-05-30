import { FC, forwardRef } from "react"

import { Flex, FlexProps } from "@/components/Flex"
import { Text, TextProps } from "@/components/Text"
import { getToken, px } from "@/utils"

import { SThumb, SToggle, ToggleProps } from "./Toggle.styled"

export const ToggleRoot: FC<FlexProps> = ({ children, ...props }) => {
  return (
    <Flex gap={8} align="center" {...props}>
      {children}
    </Flex>
  )
}

ToggleRoot.displayName = "ToggleRoot"

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      checked = false,
      disabled,
      name,
      size = "medium",
      className,
      onCheckedChange,
      ...props
    },
    ref,
  ) => (
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
  ),
)

Toggle.displayName = "Toggle"

export const ToggleLabel = forwardRef<HTMLParagraphElement, TextProps>(
  (props, ref) => {
    return (
      <Text
        ref={ref}
        fw={500}
        fs="p5"
        lh={px(14.4)}
        color={getToken("text.high")}
        sx={{ whiteSpace: "nowrap" }}
        {...props}
      />
    )
  },
)

ToggleLabel.displayName = "ToggleLabel"
