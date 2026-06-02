import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const SContainer = styled.div(
  ({ theme }) => css`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    border-radius: inherit;
    overflow: hidden;

    backdrop-filter: blur(5px);

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      background: ${theme.surfaces.themeBasePalette.surfaceHigh};
      opacity: 0.5;
      z-index: -1;
    }
  `,
)
