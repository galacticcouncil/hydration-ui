import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { LabelPosition } from "./CircularProgress"

export const SContainer = styled.div`
  display: inline-flex;
  overflow: hidden;
  position: relative;
  gap: 10px;

  width: fit-content;
  height: fit-content;

  svg {
    order: 1;
  }
`

export const SText = styled.span<{ position: LabelPosition }>(
  ({ theme, position }) => css`
    color: ${theme.text.high};
    line-height: 1;

    display: flex;
    align-items: center;
    justify-content: center;

    ${position === "center"
      ? `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      `
      : position === "start"
        ? "order: 0"
        : "order: 2"}
  `,
)
