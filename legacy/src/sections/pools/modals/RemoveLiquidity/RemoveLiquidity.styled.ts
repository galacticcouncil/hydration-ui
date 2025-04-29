import styled from "@emotion/styled"
import { theme } from "theme"

export const SSlippage = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 8px;
  align-items: center;

  padding: 8px;
  margin: 32px 0 16px 0;

  background-color: rgba(${theme.rgbColors.black}, 0.25);
  border-radius: 12px;
`

export const STradingPairContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  padding: 16px 12px;

  background-color: rgba(${theme.rgbColors.alpha0}, 0.06);
  border-radius: 4px;

  @media ${theme.viewport.gte.sm} {
    padding: 18px 20px;
  }
`
