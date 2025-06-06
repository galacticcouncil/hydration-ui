import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const SContainer = styled.div`
  position: relative;
  margin-top: 50px;
  margin-bottom: 50px;
`

export const SLiquidationMarkerContainer = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  z-index: 2;
`

export const SLiquidationMarker = styled.div(
  ({ theme }) => css`
    position: relative;
    white-space: nowrap;

    &::after {
      content: "";
      position: absolute;
      bottom: calc(100% + 2px);
      left: 50%;
      transform: translateX(-50%);
      height: 10px;
      width: 2px;
      background-color: ${theme.accents.danger.emphasis};
    }
  `,
)

export const SCurrentValueMarker = styled.div`
  position: relative;
  white-space: nowrap;

  &::after {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 6px 4px 0 4px;
    border-color: currentColor transparent transparent transparent;
    left: 50%;
    transform: translateX(-50%);
  }
`

export const SCurrentValueWrapper = styled.div`
  position: absolute;
  bottom: calc(100% + 6px);
  z-index: 3;
`

export const SScaleBar = styled.div(
  ({ theme }) => css`
    height: 4px;
    width: 100%;
    border-radius: 1px;
    position: relative;
    background-color: ${theme.details.separators};
  `,
)

export const SScaleBarFill = styled.div<{ $width: string; $color: string }>`
  position: absolute;
  left: 0;
  height: 4px;
  border-radius: 1px;
  width: ${({ $width }) => $width};
  max-width: 100%;
  background-color: ${({ $color }) => $color};
  z-index: 2;
`

export const SScaleBarStripes = styled.div<{ $width: string; $color: string }>(
  ({ theme, $width, $color }) => css`
    position: absolute;
    left: 0;
    height: 4px;
    border-radius: 1px;
    width: ${$width};
    max-width: 100%;
    background: repeating-linear-gradient(
      -45deg,
      ${theme.details.separators},
      ${theme.details.separators} 4px,
      ${$color} 4px,
      ${$color} 7px
    );
  `,
)
