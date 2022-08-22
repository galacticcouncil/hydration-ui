import styled from "styled-components"
import { theme } from "theme"

export const ConversionWrapper = styled.div`
  border-radius: 7px;
  background: ${theme.colors.backgroundGray800};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 6px 14px;
  display: flex;
  align-items: center;
  gap: 6px;

  p {
    font-size: 11px;
    line-height: 15px;
  }
`
