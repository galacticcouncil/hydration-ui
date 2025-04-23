import styled from "@emotion/styled"
import { theme } from "theme"

export const SGuideItemCount = styled.div`
  width: 24px;
  height: 24px;

  display: flex;
  justify-content: center;
  align-items: center;

  border: 1px solid rgba(${theme.rgbColors.primaryA35}, 0.35);
  border-radius: 8px;

  background: linear-gradient(
    180deg,
    rgba(0, 87, 159, 0.39) 0%,
    rgba(2, 59, 106, 0.39) 25%,
    rgba(6, 9, 23, 0.39) 100%
  );
  color: ${theme.colors.white};

  @media (${theme.viewport.gte.sm}) {
    width: 33px;
    height: 33px;
  }
`
