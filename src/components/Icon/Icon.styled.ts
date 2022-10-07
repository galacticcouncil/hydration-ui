import styled from "@emotion/styled"
import { css } from "@emotion/react"

export const SIconWrapper = styled.span<{ size?: number }>`
  display: flex;
  ${(p) =>
    p.size &&
    css`
      width: ${p.size}px;
      height: ${p.size}px;

      svg {
        width: ${p.size}px;
        height: ${p.size}px;
      }
    `}
`
