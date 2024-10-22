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

export const SText = styled.span<{ position: LabelPosition }>`
  color: #fff;
  line-height: 1;

  display: flex;
  align-items: center;
  justify-content: center;

  ${({ position }) => {
    if (position === "center") {
      return `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      `
    }

    return position === "start" ? "order: 0" : "order: 2"
  }}
`
