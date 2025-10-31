import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { createVariants } from "@galacticcouncil/ui/utils"

export const dynamicFeeRangeTypes = ["low", "middle", "high"] as const
export type DynamicFeeRangeType = (typeof dynamicFeeRangeTypes)[number]

const variantStyles = (outer: string, inner: string) => css`
  background: ${outer};

  & > div {
    background: ${inner};
  }
`

const colors = createVariants<DynamicFeeRangeType>(({ accents }) => ({
  low: variantStyles(accents.success.dim, accents.success.emphasis),
  middle: variantStyles(accents.alertAlt.dimBg, accents.alertAlt.primary),
  high: variantStyles(accents.alert.dimBg, accents.alert.primary),
}))

export const SFeeSection = styled.div<{
  isActive: boolean
  type: DynamicFeeRangeType
}>(({ theme, isActive, type }) => [
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
])

export const SFullFeeRangeItem = styled.div<{
  isActive: boolean
  type: DynamicFeeRangeType
}>(({ theme, isActive, type }) => [
  css`
    height: 15px;
    width: 100%;

    display: flex;
    flex-direction: row;
    align-items: center;

    & > div {
      width: 100%;
      height: 1px;

      border-radius: ${theme.radii.full}px;

      margin-left: 8px;
      margin-right: 8px;
    }
  `,
  isActive
    ? colors(type)
    : css`
        background: ${theme.controls.dim.base};
      `,
])

export const SLine = styled.div(
  ({ theme }) => css`
    width: calc(100% - 16px);
    height: 1px;
    background: ${theme.controls.dim.accent};
    position: absolute;
    margin: auto;
    inset: 0;
  `,
)
