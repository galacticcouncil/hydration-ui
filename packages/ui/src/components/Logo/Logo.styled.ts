import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { mapValues } from "remeda"

import { createVariants } from "@/utils"

import { Icon } from "../Icon"
import { Image } from "../Image"
import { LogoSize } from "./Logo"

export const LOGO_SIZES = {
  "extra-small": 12,
  small: 18,
  medium: 24,
  large: 36,
} as const

const sizes = createVariants(() =>
  mapValues(
    LOGO_SIZES,
    (size) => css`
      width: ${size}px;
      height: ${size}px;
      font-size: ${size}px;
    `,
  ),
)

export const SLogo = styled(Image, {
  shouldForwardProp: (prop) => prop !== "size",
})<{
  size: LogoSize
}>(({ size, theme }) => [
  sizes(size),
  css`
    position: relative;
    border-radius: ${theme.radii.full}px;
  `,
])

export const SLogoPlaceholder = styled(Icon, {
  shouldForwardProp: (prop) => prop !== "size",
})<{
  size: LogoSize
}>(({ size, theme }) => [
  css`
    display: inline-flex;
    border-radius: ${theme.radii.full}px;
    padding: 2px;
    color: ${theme.text.low};
    background-color: ${theme.surfaces.themeBasePalette.surfaceHigh};
  `,
  sizes(size),
])
