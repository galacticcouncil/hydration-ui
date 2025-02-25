import styled from "@emotion/styled"
import { theme } from "theme"

export const SBankBox = styled.a`
  position: relative;

  display: flex;

  flex-direction: column;
  gap: 20px;

  border-radius: ${theme.borderRadius.medium}px;
  padding: 20px;

  transition: background-color ${theme.transitions.default};

  background-color: rgba(${theme.rgbColors.alpha0}, 0.06);

  :hover {
    background-color: rgba(${theme.rgbColors.alpha0}, 0.1);
  }

  @media ${theme.viewport.gte.sm} {
    gap: 30px;
    padding: 30px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`
