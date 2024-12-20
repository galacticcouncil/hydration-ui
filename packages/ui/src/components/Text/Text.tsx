import { ResponsiveStyleValue, ThemeUICSSProperties } from "@theme-ui/core"
import { forwardRef } from "react"

import { Box, BoxProps } from "@/components"
import { ThemeFont, ThemeProps } from "@/theme"
import { getToken } from "@/utils"

type TextSize = keyof ThemeProps["typography"]["text"]["size"]

export type TextProps = BoxProps & {
  fw?: ResponsiveStyleValue<400 | 500 | 600>
  fs?: TextSize | ResponsiveStyleValue<number>
  font?: ThemeFont
  align?: ThemeUICSSProperties["textAlign"]
  transform?: ThemeUICSSProperties["textTransform"]
  decoration?: ThemeUICSSProperties["textDecoration"]
}

export const getFontSizeProps = (fs: TextProps["fs"]) => {
  if (typeof fs === "string") {
    return { variant: `typography.text.size.${fs}` }
  }
  return { fontSize: fs }
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
          fontWeight: fw,
          textAlign: align,
          textTransform: transform,
          textDecoration: decoration,
          ...getFontSizeProps(fs),
        }}
        {...props}
      />
    )
  },
)

Text.displayName = "Text"
