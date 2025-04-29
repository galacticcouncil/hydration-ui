import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { createVariants } from "@galacticcouncil/ui/utils"

import { RangeType } from "./DynamicFee"

const variantStyles = (outer: string, inner: string) => css`
  background: ${outer};

  & > div {
    background: ${inner};
  }
`

const colors = createVariants(({ accents }) => ({
  low: variantStyles(accents.success.dim, accents.success.emphasis),
  middle: variantStyles(accents.alertAlt.dimBg, accents.alertAlt.primary),
  high: variantStyles(accents.alert.dimBg, accents.alert.primary),
}))

export const SFeeSection = styled.div<{ isActive: boolean; type: RangeType }>(
  ({ theme, isActive, type }) => [
    css`
      width: 18px;
      height: 6px;

      padding: 1px;

      border-radius: ${theme.radii.full}px;

      & > div {
        width: 100%;
        height: 100%;

        border-radius: ${theme.radii.full}px;
      }
    `,
    isActive
      ? colors(type)
      : css`
          background: ${theme.controls.dim.accent};
        `,
  ],
)
