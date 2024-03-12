import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;

  background: rgba(${theme.rgbColors.alpha0}, 0.06);
  border: 1px solid rgba(${theme.rgbColors.primaryA0}, 0.35);

  border-radius: 4px;
  padding: 16px;

  @media (${theme.viewport.gte.sm}) {
    padding: 20px;
  }
`
