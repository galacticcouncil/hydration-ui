import { size } from "common/styles"
import styled from "styled-components/macro"
import { theme } from "theme"

export const StyledInput = styled.input`
  background: ${theme.colors.backgroundGray800};
  border-radius: 9px;
  border: 1px solid ${theme.colors.backgroundGray600};
  color: ${theme.colors.white};
  //   color: rgba(${theme.rgbColors.white}, 0.4);
  font-size: 14px;
  padding: 20px 18px;

  ${size};
`
