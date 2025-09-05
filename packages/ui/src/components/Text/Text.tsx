import { ResponsiveStyleValue, ThemeUICSSProperties } from "@theme-ui/core"
import { FC, Ref } from "react"

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
  wordBreak?: ThemeUICSSProperties["wordBreak"]
  truncate?: true | ResponsiveStyleValue<number | string>
  ref?: Ref<HTMLParagraphElement>
}

export const getFontSizeProps = (fs: TextProps["fs"]) => {
  if (typeof fs === "string") {
    return { variant: `typography.text.size.${fs}` }
  }
  return { fontSize: fs }
}

const getTruncateProps = (truncate: TextProps["truncate"]) => ({
  textOverflow: "ellipsis",
  overflow: "hidden",
  whiteSpace: "nowrap",
  maxWidth: typeof truncate === "boolean" ? undefined : truncate,
})

export const Text: FC<TextProps> = ({
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
  wordBreak,
  ref,
  ...props
}) => {
  return (
    <Box
      as={as}
      ref={ref}
      sx={{
        fontFamily:
          font === "mono" ? "GeistMono" : getToken(`fontFamilies1.${font}`),
        fontWeight: fw,
        textAlign: align,
        textTransform: transform,
        textDecoration: decoration,
        lineHeight: lh,
        whiteSpace,
        wordBreak,
        ...getFontSizeProps(fs),
        ...(truncate && getTruncateProps(truncate)),
      }}
      {...props}
    />
  )
}
