import { ResponsiveStyleValue, ThemeUICSSProperties } from "@theme-ui/core"
import { forwardRef } from "react"

import { Box, BoxProps } from "@/components"
import { ThemeFont, ThemeProps } from "@/theme"
import { getToken } from "@/utils"

type TextSize = keyof ThemeProps["typography"]["text"]["size"]

export type TextProps = BoxProps & {
  fw?: ResponsiveStyleValue<400 | 500 | 600>
  lh?: ResponsiveStyleValue<number | string>
  fs?: TextSize | ResponsiveStyleValue<number>
  font?: ThemeFont
  align?: ThemeUICSSProperties["textAlign"]
  transform?: ThemeUICSSProperties["textTransform"]
  decoration?: ThemeUICSSProperties["textDecoration"]
  whiteSpace?: ThemeUICSSProperties["whiteSpace"]
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
      lh,
      fw,
      align,
      transform,
      decoration,
      whiteSpace,
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
          lineHeight: lh,
          whiteSpace,
          ...getFontSizeProps(fs),
        }}
        {...props}
      />
    )
  },
)

Text.displayName = "Text"
