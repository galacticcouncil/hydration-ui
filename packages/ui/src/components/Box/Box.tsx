import { Interpolation } from "@emotion/react"
import { Slot } from "@radix-ui/react-slot"
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

const borderProps = [
  "border",
  "borderTop",
  "borderBottom",
  "borderLeft",
  "borderRight",
  "borderStyle",
  "borderColor",
  "borderTopRadius",
  "borderBottomRadius",
  "borderLeftRadius",
  "borderRightRadius",
]

const allBoxProps = [...boxSystemProps, ...borderProps]

type BoxSystemPropsKeys = (typeof boxSystemProps)[number]
type BoxSystemProps = Pick<ThemeUICSSProperties, BoxSystemPropsKeys>

export type BoxOwnProps = {
  asChild?: boolean
  as?: React.ElementType
  css?: Interpolation<unknown>
  sx?: ThemeUIStyleObject<Theme>
  bg?: ThemeColor | ThemeUICSSProperties["backgroundColor"]
  color?: ThemeColor | ThemeUICSSProperties["color"]
  border?: ResponsiveStyleValue<number>
  borderTop?: ResponsiveStyleValue<number>
  borderBottom?: ResponsiveStyleValue<number>
  borderLeft?: ResponsiveStyleValue<number>
  borderRight?: ResponsiveStyleValue<number>
  borderStyle?: ThemeUICSSProperties["borderStyle"]
  borderColor?: ThemeColor | ThemeUICSSProperties["borderColor"]
  borderTopRadius?: ResponsiveStyleValue<string | number>
  borderBottomRadius?: ResponsiveStyleValue<string | number>
  borderLeftRadius?: ResponsiveStyleValue<string | number>
  borderRightRadius?: ResponsiveStyleValue<string | number>
  children?: React.ReactNode
}

export type BoxProps = BoxOwnProps &
  Omit<BoxSystemProps, "bg" | "color" | "borderColor"> &
  Omit<React.HTMLAttributes<HTMLElement>, "color">

const pickSystemProps = (props: BoxProps) => {
  const res: Partial<Pick<BoxSystemProps, (typeof boxSystemProps)[number]>> = {}
  for (const key of boxSystemProps) {
    // @ts-expect-error ts2590: union is too large
    res[key] = props[key]
  }

  return res
}

const pickBorderStyles = (props: BoxProps) => {
  const {
    border,
    borderTop,
    borderBottom,
    borderLeft,
    borderRight,
    borderStyle,
    borderTopRadius,
    borderBottomRadius,
    borderLeftRadius,
    borderRightRadius,
  } = props

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
  if (border || borderTop || borderBottom || borderLeft || borderRight) {
    Object.assign(res, {
      borderWidth: border ?? 0,
      borderTopWidth: borderTop,
      borderBottomWidth: borderBottom,
      borderLeftWidth: borderLeft,
      borderRightWidth: borderRight,
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

  if (borderLeftRadius) {
    Object.assign(res, {
      borderTopLeftRadius: borderLeftRadius,
      borderBottomLeftRadius: borderLeftRadius,
    })
  }

  if (borderRightRadius) {
    Object.assign(res, {
      borderTopRightRadius: borderRightRadius,
      borderBottomRightRadius: borderRightRadius,
    })
  }

  return res
}

export const Box = forwardRef<HTMLElement, BoxProps>(
  (
    { css: cssProp, sx, as: Component = "div", asChild = false, ...rest },
    ref,
  ) => {
    const { theme } = useThemeUI()

    const sxPropStyles = css(sx)(theme)
    const systemStyles = css(pickSystemProps(rest))(theme)
    const borderStyles = css(pickBorderStyles(rest))(theme)

    const styles = [cssProp, sxPropStyles, systemStyles, borderStyles]

    allBoxProps.forEach((name) => {
      delete (rest as Record<string, unknown>)[name]
    })

    const SlottedComponent = asChild ? Slot : Component

    return <SlottedComponent ref={ref} css={styles} {...rest} />
  },
)

Box.displayName = "Box"
