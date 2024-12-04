import { ResponsiveStyleValue, ThemeUICSSProperties } from "@theme-ui/core"
import React, { forwardRef } from "react"

import { Box, BoxProps } from "@/components"
import { ThemeFont } from "@/theme"
import { getToken } from "@/utils"

export type TextProps = BoxProps & {
  fw?: ResponsiveStyleValue<400 | 500 | 600>
  fs?: ResponsiveStyleValue<string | number>
  font?: ThemeFont
  align?: ThemeUICSSProperties["textAlign"]
  transform?: ThemeUICSSProperties["textTransform"]
  decoration?: ThemeUICSSProperties["textDecoration"]
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  (
    {
      as = "p",
      fs,
      fw,
      align,
      transform,
      decoration,
      font = "secondary",
      ...props
    },
    ref,
  ) => {
    return (
      <Box
        as={as}
        ref={ref}
        sx={{
          fontFamily: getToken(`fontFamilies1.${font}`),
          fontSize: fs,
          fontWeight: fw,
          textAlign: align,
          textTransform: transform,
          textDecoration: decoration,
        }}
        {...props}
      />
    )
  },
)

Text.displayName = "Text"
