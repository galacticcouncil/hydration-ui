import { Interpolation } from "@emotion/react"
import { ResponsiveStyleValue, Theme, useThemeUI } from "@theme-ui/core"
import { css, ThemeUICSSProperties, ThemeUIStyleObject } from "@theme-ui/css"
import React, { forwardRef } from "react"

import { ThemeColor } from "@/theme"

const boxSystemProps = [
  "m",
  "mt",
  "mr",
  "mb",
  "ml",
  "mx",
  "my",
  "p",
  "pt",
  "pr",
  "pb",
  "pl",
  "px",
  "py",
  "display",
  "color",
  "bg",
  "borderColor",
  "borderRadius",
  "opacity",
  "width",
  "height",
  "size",
] as const

type BoxSystemPropsKeys = (typeof boxSystemProps)[number]
type BoxSystemProps = Pick<ThemeUICSSProperties, BoxSystemPropsKeys>

export type BoxOwnProps = {
  as?: React.ElementType
  css?: Interpolation<unknown>
  sx?: ThemeUIStyleObject<Theme>
  bg?: ThemeColor | ThemeUICSSProperties["backgroundColor"]
  color?: ThemeColor | ThemeUICSSProperties["color"]
  border?: ResponsiveStyleValue<number>
  borderStyle?: ThemeUICSSProperties["borderStyle"]
  borderColor?: ThemeColor | ThemeUICSSProperties["borderColor"]
  borderTopRadius?: ResponsiveStyleValue<string | number>
  borderBottomRadius?: ResponsiveStyleValue<string | number>
}

export type BoxProps = BoxOwnProps &
  Omit<BoxSystemProps, "bg" | "color" | "borderColor"> &
  React.HTMLAttributes<HTMLElement>

const pickSystemProps = (props: BoxProps) => {
  const res: Partial<Pick<BoxSystemProps, (typeof boxSystemProps)[number]>> = {}
  for (const key of boxSystemProps) {
    // @ts-expect-error ts2590: union is too large
    res[key] = props[key]
  }

  return res
}

const pickBorderStyles = (props: BoxProps) => {
  const { border, borderStyle, borderTopRadius, borderBottomRadius } = props

  const res: Partial<
    Pick<
      ThemeUICSSProperties,
      | "borderWidth"
      | "borderStyle"
      | "borderTopLeftRadius"
      | "borderTopRightRadius"
      | "borderBottomLeftRadius"
      | "borderBottomRightRadius"
    >
  > = {}
  if (border) {
    Object.assign(res, {
      borderWidth: border,
      borderStyle: borderStyle ?? "solid",
    })
  }

  if (borderTopRadius) {
    Object.assign(res, {
      borderTopLeftRadius: borderTopRadius,
      borderTopRightRadius: borderTopRadius,
    })
  }

  if (borderBottomRadius) {
    Object.assign(res, {
      borderBottomLeftRadius: borderBottomRadius,
      borderBottomRightRadius: borderBottomRadius,
    })
  }

  return res
}

export const Box = forwardRef<HTMLElement, BoxProps>(
  ({ css: cssProp, sx, as: Component = "div", ...rest }, ref) => {
    const { theme } = useThemeUI()

    const sxPropStyles = css(sx)(theme)
    const systemStyles = css(pickSystemProps(rest))(theme)
    const borderStyles = css(pickBorderStyles(rest))(theme)

    const styles = [cssProp, sxPropStyles, systemStyles, borderStyles]

    boxSystemProps.forEach((name) => {
      delete (rest as Record<string, unknown>)[name]
    })

    return <Component ref={ref} css={styles} {...rest} />
  },
)

Box.displayName = "Box"
