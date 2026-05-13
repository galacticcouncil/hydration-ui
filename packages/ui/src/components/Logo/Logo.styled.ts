import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { mapValues } from "remeda"

import { createVariants, pxToRem } from "@/utils"

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
      width: ${pxToRem(size)};
      height: ${pxToRem(size)};
      font-size: ${pxToRem(size)};
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
    flex-shrink: 0;
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
    align-items: center;
    justify-content: center;
    svg {
      width: 75%;
      height: 75%;
    }
  `,
  sizes(size),
])
