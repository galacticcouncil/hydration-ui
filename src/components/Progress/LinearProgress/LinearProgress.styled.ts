import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { theme } from "theme"
import { BarSize, ColorType, LabelPosition } from "./LinearProgress"

const getBarSize = (size: BarSize) => {
  switch (size) {
    case "small":
      return css`
        height: 7px;
      `
    case "medium":
      return css`
        height: 12px;
      `
    case "large":
      return css`
        height: 18px;
      `
  }
}

const getLabelSize = (size: BarSize) => {
  switch (size) {
    case "small":
      return css`
        font-size: 11px;
      `
    case "medium":
      return css`
        font-size: 13px;
      `
    case "large":
      return css`
        font-size: 16px;
      `
  }
}

const getBarColorStyle = (colorStart: ColorType, colorEnd?: ColorType) => {
  if (colorStart && colorEnd) {
    return css`
      background: linear-gradient(
        270deg,
        ${theme.colors[colorStart]} 0%,
        ${theme.colors[colorEnd]} 100%
      );
    `
  }

  return css`
    background: ${theme.colors[colorStart]};
  `
}

export const SContainer = styled.div`
  position: relative;
  text-align: center;

  width: 100%;

  display: flex;
  align-items: center;
  gap: 10px;
`

export const SBarContainer = styled.div<{ size: BarSize }>`
  order: 1;

  background-color: rgba(${theme.rgbColors.primaryA0}, 0.35);
  border-radius: 9999px;
  overflow: hidden;
  width: 100%;
  position: relative;

  ${({ size }) => getBarSize(size || "medium")};
`

export const Filler = styled.div<{ percentage: number }>`
  transition: width 2s ease-i-out;
  height: inherit;
  border-radius: inherit;
  overflow: hidden;
  width: ${({ percentage }) => percentage}%;
`

export const SBar = styled.div<{
  colorStart: ColorType
  colorEnd?: ColorType
  percentage: number
  colorCustom?: string
}>`
  height: inherit;
  transition: width 2s ease-i-out;
  width: ${({ percentage }) => (100 / percentage) * 100}%;
  ${({ colorStart, colorEnd, colorCustom }) =>
    colorCustom
      ? `background: ${colorCustom};`
      : getBarColorStyle(colorStart, colorEnd).styles}
`

export const SText = styled.span<{
  position: LabelPosition
  size: BarSize
  color: keyof typeof theme.colors
}>`
  color: ${({ color }) => theme.colors[color]};
  line-height: 1;
  flex-shrink: 0;

  ${({ size }) => getLabelSize(size || "medium")}

  ${({ position }) => {
    if (position === "start") {
      return "order: 0;"
    }

    if (position === "end") {
      return "order: 2;"
    }

    if (position === "none") {
      return "display: none;"
    }
  }}
`
