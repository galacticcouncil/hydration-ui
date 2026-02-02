import styled from "@emotion/styled"

import {
  ProgressBarOrientation,
  ProgressBarSize,
} from "@/components/ProgressBar/ProgressBar"
import { createVariants, css } from "@/utils"
const containerSizes = createVariants<ProgressBarSize>(
  ({ containers, space, lineHeights }) => ({
    small: css`
      gap: ${space.m};

      padding-block: ${space.s};
    `,
    medium: css`
      gap: ${space.base};

      padding-block: ${space.s};

      & ${SProgressBar} {
        height: 0.375rem;
      }

      & ${SProgressBarLabel} {
        font-weight: 400;
        line-height: 1;
      }
    `,
    large: css`
      gap: ${containers.paddings.quart};

      padding-block: ${containers.paddings.quart};

      & ${SProgressBar} {
        height: 0.5rem;
      }

      & ${SProgressBarLabel} {
        font-weight: 400;
        line-height: ${lineHeights.m};
      }
    `,
  }),
)

export const SContainer = styled.div<{
  readonly size: ProgressBarSize
  readonly orientation?: ProgressBarOrientation
}>(({ size, orientation = "horizontal" }) => [
  css`
    display: grid;
    align-items: center;
    ${orientation === "horizontal"
      ? "grid-template-columns: 1fr auto;"
      : "grid-template-rows: 1fr auto; grid-template-columns: 1fr; gap: 8px;"}
  `,
  containerSizes(size),
])

export const SProgressBar = styled.div(
  ({ theme }) => css`
    position: relative;

    height: ${theme.sizes["3xs"]};
    border-radius: ${theme.radii.xl};
    background: ${theme.controls.dim.base};

    overflow: hidden;
  `,
)

export const SProgressBarFill = styled.div<{
  readonly value: number
}>(
  ({ theme, value }) => css`
    position: absolute;
    top: 0;
    left: 0;

    width: ${value}%;
    height: 100%;

    background: ${theme.controls.solid.accent};

    transition: width 0.2s;
    @starting-style {
      width: 0%;
    }
  `,
)

export const SProgressBarLabel = styled.span(
  ({ theme }) => css`
    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 500;
    font-size: ${theme.fontSizes.p4};
    line-height: 1;

    color: ${theme.text.tint.secondary};
  `,
)
