import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  gap: 24px;
  flex-direction: column;

  justify-content: space-between;

  background: linear-gradient(
      270deg,
      rgba(76, 243, 168, 0.12) 0.23%,
      rgba(76, 243, 168, 0) 67.62%,
      rgba(76, 243, 168, 0) 100%
    ),
    rgba(255, 255, 255, 0.03);

  outline: 1px solid rgba(${theme.rgbColors.white}, 0.06);
  outline-offset: -1px;

  border-radius: 12px;
  padding: 30px;

  @media ${theme.viewport.gte.sm} {
    flex-direction: row;
    align-items: center;
    gap: 0;
  }
`
