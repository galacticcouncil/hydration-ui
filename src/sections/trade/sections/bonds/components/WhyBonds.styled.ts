import { gradientBorder, theme } from "theme"
import styled from "@emotion/styled"

export const SWhyBonds = styled.div<{ expanded: boolean }>`
  ${gradientBorder};

  background: rgba(17, 19, 32, 1);
  margin-bottom: 40px;
  padding: 30px;
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
