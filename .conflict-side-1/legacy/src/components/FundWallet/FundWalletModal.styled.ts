import styled from "@emotion/styled"
import { theme } from "theme"

export const SBlocks = styled.div`
  display: flex;
  flex-flow: column;
  row-gap: 10px;
`

export const SCryptoBlock = styled.div`
  position: relative;

  border-radius: ${theme.borderRadius.default}px;
  padding: 30px;

  transition: background-color ${theme.transitions.default};

  background-color: rgba(${theme.rgbColors.alpha0}, 0.06);

  :hover {
    background-color: rgba(${theme.rgbColors.alpha0}, 0.1);
  }
`
