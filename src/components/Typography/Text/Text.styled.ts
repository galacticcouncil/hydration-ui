import { colors, fonts, margins } from "common/styles";
import styled from "styled-components/macro";
import { theme } from "theme";
import { TextProps } from "./Text";

export const StyledText = styled.p<TextProps>`
  color: ${theme.colors.neutralGray100};
  font-size: ${(p) => p.fs || 16}px;
  ${colors};
  ${margins};
  ${fonts};
`;
