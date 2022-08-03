import { colors, flex, margins, paddings, size } from "common/styles";
import styled from "styled-components/macro";
import { BoxTypes } from "./Box";

export const StyledBox = styled.div<BoxTypes>`
  ${flex};
  ${margins};
  ${paddings};
  ${size};
  ${colors};
`;
