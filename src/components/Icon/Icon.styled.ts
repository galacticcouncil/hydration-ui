import { margins, size } from "utils/styles"
import styled from "@emotion/styled"
import { css } from "@emotion/react"
import { IconProps } from "./Icon"

export const SIconWrapper = styled.span<IconProps>`
  display: flex;
  ${size};
  ${margins};
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
