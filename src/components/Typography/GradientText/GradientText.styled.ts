import styled from "styled-components/macro";
import { theme } from "theme";
import { Text, TextProps } from "../Text/Text";

export const StyledGradientText = styled(Text)<TextProps>`
  display: inline-block;
  background: linear-gradient(${theme.gradients.simplifiedGradient});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;
