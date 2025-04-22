import { ResponsiveStyleValue, ThemeUICSSProperties } from "@theme-ui/core"
import { forwardRef } from "react"

import { Box, BoxProps } from "@/components"
import { ThemeFont, ThemeProps } from "@/theme"
import { getToken } from "@/utils"

type TextSize = keyof ThemeProps["typography"]["text"]["size"]

export type TextProps = BoxProps & {
  fw?: ResponsiveStyleValue<400 | 500 | 600 | 700>
  lh?: ResponsiveStyleValue<number | string>
  fs?: TextSize | ResponsiveStyleValue<number>
  font?: ThemeFont
  align?: ThemeUICSSProperties["textAlign"]
  transform?: ThemeUICSSProperties["textTransform"]
  decoration?: ThemeUICSSProperties["textDecoration"]
  whiteSpace?: ThemeUICSSProperties["whiteSpace"]
  truncate?: true | ResponsiveStyleValue<number | string>
}

export const getFontSizeProps = (fs: TextProps["fs"]) => {
  if (typeof fs === "string") {
    return { variant: `typography.text.size.${fs}` }
  }
  return { fontSize: fs }
}

const getTruncateProps = (truncate: TextProps["truncate"]) => {
  if (typeof truncate === "boolean") {
    return {
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
    }
  }
  return {
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
    maxWidth: truncate,
  }
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
      truncate,
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
          ...(truncate && getTruncateProps(truncate)),
        }}
        {...props}
      />
    )
  },
)

Text.displayName = "Text"
