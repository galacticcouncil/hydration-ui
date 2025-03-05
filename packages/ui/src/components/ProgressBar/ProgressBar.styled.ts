import styled from "@emotion/styled"

import { ProgressBarSize } from "@/components/ProgressBar/ProgressBar"
import { createVariants, css } from "@/utils"

const containerSizes = createVariants<ProgressBarSize>(({ containers }) => ({
  small: css`
    gap: 12px;

    padding-block: 4px;
  `,
  large: css`
    gap: ${containers.paddings.quart}px;

    padding-block: ${containers.paddings.quart}px;

    & ${SProgressBar} {
      height: 8px;
    }

    & ${SProgressBarLabel} {
      font-weight: 400px;
      line-height: 16.9px;
    }
  `,
}))

export const SContainer = styled.div<{ readonly size: ProgressBarSize }>(
  ({ size }) => [
    css`
      display: grid;
      align-items: center;
      grid-template-columns: 1fr auto;
    `,
    containerSizes(size),
  ],
)

export const SProgressBar = styled.div(
  ({ theme }) => css`
    position: relative;

    height: 4px;
    border-radius: 16px;
    background: ${theme.controls.dim.base};

    overflow: hidden;
  `,
)

export const SProgressBarFill = styled.div<{ readonly value: number }>(
  ({ theme, value }) => css`
    position: absolute;
    top: 0;
    left: 0;

    width: ${value}%;
    height: 100%;

    background: ${theme.controls.solid.accent};
  `,
)

export const SProgressBarLabel = styled.span(
  ({ theme }) => css`
    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 500;
    font-size: ${theme.paragraphSize.p4};
    line-height: 13px;

    color: ${theme.text.tint.secondary};
  `,
)
