import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;

  padding: 4px;
  padding-left: 14px;

  border: 1px solid ${theme.colors.darkBlue400};
  border-radius: ${theme.borderRadius.default}px;

  @media${theme.viewport.gte.sm} {
    width: 185px;
  }
`
