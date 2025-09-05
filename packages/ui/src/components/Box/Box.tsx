import { Interpolation } from "@emotion/react"
import { Slot } from "@radix-ui/react-slot"
import { Theme } from "@theme-ui/core"
import { ThemeUICSSProperties, ThemeUIStyleObject } from "@theme-ui/css"
import React from "react"

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
    | "visibility"
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
  Omit<React.HTMLAttributes<HTMLElement>, "color"> & {
    ref?: React.Ref<HTMLDivElement>
  }

export const Box: React.FC<BoxProps> = ({
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
  visibility,
  ...rest
}) => {
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
    visibility,
  }

  return <SlottedComponent sx={fullSx} css={css} {...rest} />
}
