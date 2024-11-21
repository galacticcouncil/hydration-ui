import { ResponsiveStyleValue, ThemeUICSSProperties } from "@theme-ui/core"
import React, { forwardRef } from "react"

import { ThemeColor, ThemeFont } from "@/theme"

import { SText, STextProps } from "./Text.styled"

export type TextProps = STextProps & {
  as?: React.ElementType
  children: React.ReactNode
  fw?: ResponsiveStyleValue<400 | 500 | 600>
  fs?: ResponsiveStyleValue<string | number>
  font?: ThemeFont
  color?: ThemeColor | ThemeUICSSProperties["color"]
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ color, as = "p", fs, fw, ...props }, ref) => {
    return (
      <SText
        as={as}
        ref={ref}
        sx={{
          color,
          fontSize: fs,
          fontWeight: fw,
        }}
        {...props}
      />
    )
  },
)

Text.displayName = "Text"
