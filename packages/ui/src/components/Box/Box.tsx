import { Interpolation } from "@emotion/react"
import { Slot } from "@radix-ui/react-slot"
import { Theme } from "@theme-ui/core"
import { ThemeUICSSProperties, ThemeUIStyleObject } from "@theme-ui/css"
import React, { forwardRef } from "react"

import { ThemeColor } from "@/theme"

export type BoxOwnProps = Partial<
  Pick<
    ThemeUICSSProperties,
    | "m"
    | "mt"
    | "mr"
    | "mb"
    | "ml"
    | "mx"
    | "my"
    | "p"
    | "pt"
    | "pr"
    | "pb"
    | "pl"
    | "px"
    | "py"
    | "display"
    | "position"
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "transform"
    | "width"
    | "height"
    | "minWidth"
    | "maxWidth"
    | "maxHeight"
    | "size"
    | "borderRadius"
    | "borderWidth"
    | "borderStyle"
    | "alignContent"
    | "alignItems"
    | "gap"
    | "flex"
  >
> & {
  asChild?: boolean
  as?: React.ElementType
  css?: Interpolation<unknown>
  sx?: ThemeUIStyleObject<Theme>
  children?: React.ReactNode
  color?: ThemeColor | ThemeUICSSProperties["color"]
  bg?: ThemeColor | ThemeUICSSProperties["backgroundColor"]
  borderColor?: ThemeColor | ThemeUICSSProperties["borderColor"]
}

export type BoxProps = BoxOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, "color">

export const Box = forwardRef<HTMLElement, BoxProps>(
  (
    {
      css,
      sx,
      as: Component = "div",
      asChild = false,
      m,
      mt,
      mr,
      mb,
      ml,
      mx,
      my,
      p,
      pt,
      pr,
      pb,
      pl,
      px,
      py,
      display,
      position,
      color,
      bg,
      top,
      right,
      bottom,
      left,
      transform,
      width,
      height,
      minWidth,
      maxWidth,
      maxHeight,
      size,
      borderRadius,
      borderWidth,
      borderStyle,
      borderColor,
      alignContent,
      alignItems,
      gap,
      flex,
      ...rest
    },
    ref,
  ) => {
    const SlottedComponent = asChild ? Slot : Component

    const fullSx: ThemeUIStyleObject<Theme> = {
      ...sx,
      m,
      mt,
      mr,
      mb,
      ml,
      mx,
      my,
      p,
      pt,
      pr,
      pb,
      pl,
      px,
      py,
      display,
      position,
      color,
      bg,
      top,
      right,
      bottom,
      left,
      transform,
      width,
      height,
      minWidth,
      maxWidth,
      maxHeight,
      size,
      borderRadius,
      borderWidth,
      borderStyle,
      borderColor,
      alignContent,
      alignItems,
      gap,
      flex,
    }

    return <SlottedComponent ref={ref} sx={fullSx} css={css} {...rest} />
  },
)

Box.displayName = "Box"
