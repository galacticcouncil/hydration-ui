import styled from "@emotion/styled"
import { theme } from "theme"

export const SEvmAccountItem = styled.div`
  --secondary-color: ${theme.colors.brightBlue300};
  display: flex;
  flex-direction: column;

  padding: 16px;
  border-radius: 4px;

  position: relative;

  background: rgba(${theme.rgbColors.alpha0}, 0.06);

  transition: background ${theme.transitions.default};

  @media ${theme.viewport.gte.sm} {
    margin-right: 12px;
  }
`
