import { margins, size } from "common/styles";
import styled, { css } from "styled-components/macro";
import { IconProps } from "./Icon";

export const StyledIconWrapper = styled.span<IconProps>`
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
`;
