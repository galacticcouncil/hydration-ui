import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  color: ${theme.colors.white};
  background: rgba(${theme.rgbColors.primaryA15}, 0.12);

  @media (${theme.viewport.gte.sm}) {
    padding: 12px 25px;
  }
`
