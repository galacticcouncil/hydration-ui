import { Interpolation } from "@emotion/styled"
import { theme } from "theme"
import { getResponsiveStyles, ResponsiveValue } from "utils/responsive"

export interface TypographyProps {
  color?: ResponsiveValue<keyof typeof theme.colors>
  fs?: ResponsiveValue<number>
  fw?: ResponsiveValue<number>
  lh?: ResponsiveValue<number>
  font?: ResponsiveValue<"ChakraPetch" | "ChakraPetchBold" | "FontOver">
  tAlign?: ResponsiveValue<"left" | "right" | "center">
  tTransform?: ResponsiveValue<"uppercase" | "lowercase" | "none">
}

export type STypographyProps = Omit<TypographyProps, "color"> & {
  $color?: ResponsiveValue<keyof typeof theme.colors>
}

const assumePx = (val: number | string) => {
  if (typeof val === "number") return val + "px"
  return val
}

export const handleTypographyProps: Interpolation<STypographyProps> = (p) => [
  getResponsiveStyles(p.$color, (key) => ({ color: theme.colors[key] })),
  getResponsiveStyles(p.fw, (fontWeight) => ({ fontWeight })),
  getResponsiveStyles(p.fs, (fontSize) => ({ fontSize: assumePx(fontSize) })),
  getResponsiveStyles(p.lh, (value) => ({ lineHeight: assumePx(value) })),
  getResponsiveStyles(p.font, (fontFamily) => ({ fontFamily })),
  getResponsiveStyles(p.tTransform, (value) => ({ textTransform: value })),
  getResponsiveStyles(p.tAlign || "left", (textAlign) => ({ textAlign })),
]
