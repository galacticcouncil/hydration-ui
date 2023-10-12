import { gradientBorder, theme } from "theme"
import styled from "@emotion/styled"

export const SWhyBonds = styled.div<{ expanded: boolean }>`
  ${gradientBorder};

  background: rgba(${theme.rgbColors.bg}, 0.4);
  padding: 30px;

  cursor: pointer;

  :hover {
    background-color: rgba(${theme.rgbColors.alpha0}, 0.03);
  }
`

export const SBondSteps = styled.div`
  margin-top: 41px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media ${theme.viewport.gte.sm} {
    flex-direction: row;
  }
`
