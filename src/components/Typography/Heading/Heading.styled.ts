import styled from "styled-components/macro";
import { theme } from "theme";
import { HeadingProps } from "./Heading";

export const StyledH1 = styled.h1<HeadingProps>`
  color: ${theme.colors.neutralGray100};
  font-weight: ${(p) => p.weight};
  font-size: ${(p) => p.fs || 16}px;
`;
