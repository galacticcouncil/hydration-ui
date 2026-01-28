import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { mapValues } from "remeda"

import { createVariants, pxToRem } from "@/utils"

import { Icon } from "../Icon"
import { Image } from "../Image"
import { LogoSize } from "./Logo"

export const LOGO_SIZES = {
  "extra-small": pxToRem(12),
  small: pxToRem(18),
  medium: pxToRem(24),
  large: pxToRem(36),
} as const

const sizes = createVariants(() =>
  mapValues(
    LOGO_SIZES,
    (size) => css`
      width: ${size};
      height: ${size};
      font-size: ${size};
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
    border-radius: ${theme.radii.full};
  `,
])

export const SLogoPlaceholder = styled(Icon, {
  shouldForwardProp: (prop) => prop !== "size",
})<{
  size: LogoSize
}>(({ size, theme }) => [
  css`
    display: inline-flex;
    border-radius: ${theme.radii.full};
    padding: ${theme.space.xs}
    color: ${theme.text.low};
    background-color: ${theme.surfaces.themeBasePalette.surfaceHigh};
  `,
  sizes(size),
])
