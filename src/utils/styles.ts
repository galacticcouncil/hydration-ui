import { Interpolation } from "@emotion/react"
import { theme } from "theme"

type NumOrAuto = number | "auto"

export type MarginProps = {
  mt?: NumOrAuto
  mr?: NumOrAuto
  mb?: NumOrAuto
  ml?: NumOrAuto
  m?: number | string
}
export type PaddingProps = {
  pt?: number
  pr?: number
  pb?: number
  pl?: number
  p?: number | string
}

const autoOrPx = (val: NumOrAuto) => {
  if (val === "auto") return val
  return val + "px"
}

export type SizeProps = {
  width?: number
  height?: number
}

export type Color = keyof typeof theme.colors

export type ColorProps = {
  color?: Color
  bg?: Color
}

export type FlexProps = {
  align?: string
  justify?: string
  flex?: boolean
  gap?: number
  acenter?: boolean
  spread?: boolean
  column?: boolean
  wrap?: boolean
  even?: boolean
  grow?: boolean
  stretch?: boolean
  relative?: boolean
  center?: boolean
  jcenter?: boolean
}

export type FontProps = {
  fs?: number
  fw?: number
  opacity?: number
  lh?: number
  tAlign?: "left" | "right" | "center"
}

export const margins: Array<Interpolation<MarginProps>> = [
  (p) => p.mt && `margin-top: ${autoOrPx(p.mt)}`,
  (p) => p.mr && `margin-right: ${autoOrPx(p.mr)}`,
  (p) => p.mb && `margin-bottom: ${autoOrPx(p.mb)}`,
  (p) => p.ml && `margin-left: ${autoOrPx(p.ml)}`,
  (p) => p.m && `margin: ${typeof p.m === "string" ? p.m : `${p.m}px`}`,
]

export const paddings: Array<Interpolation<PaddingProps>> = [
  (p) => p.p && `padding: ${typeof p.p === "string" ? p.p : `${p.p}px`}`,
  (p) => p.pt && `padding-top: ${p.pt}px`,
  (p) => p.pr && `padding-right: ${p.pr}px`,
  (p) => p.pb && `padding-bottom: ${p.pb}px`,
  (p) => p.pl && `padding-left: ${p.pl}px`,
]

export const size: Array<Interpolation<SizeProps>> = [
  (p) => p.width && `width: ${p.width}px`,
  (p) => p.height && `height: ${p.height}px`,
]

export const flex: Array<Interpolation<FlexProps>> = [
  (p) => p.align && `align-items: ${p.align};`,
  (p) => p.justify && `justify-content: ${p.justify};`,
  (p) => p.gap && `gap: ${p.gap}px;`,
  (p) => p.flex && `display: flex;`,

  (p) => p.acenter && `align-items: center;`,
  (p) => p.jcenter && `justify-content: center;`,
  (p) => p.spread && `justify-content: space-between;`,

  (p) => p.column && `flex-direction: column;`,

  (p) => p.wrap && `flex-wrap: wrap;`,
  (p) => p.even && `> * { flex: 1; }`,
  (p) => p.grow && `flex: 1 1 1px;`,
  (p) => p.stretch && `width: 100%;`,
  (p) => p.relative && `position: relative;`,
  (p) => p.center && `margin-left: auto; margin-right: auto;`,
]

export const colors: Array<Interpolation<ColorProps>> = [
  (p) => p.color && `color: ${theme.colors[p.color]}`,
  (p) => p.bg && `background: ${theme.colors[p.bg]}`,
]

export const fonts: Array<Interpolation<FontProps>> = [
  (p) => p.opacity && `opacity: ${p.opacity}`,
  (p) => p.fs && `font-size: ${p.fs}px`,
  (p) => p.fw && `font-weight: ${p.fw}`,
  (p) => p.lh && `line-height: ${p.lh}px`,
  (p) => `text-align: ${p.tAlign || "left"}`,
]
