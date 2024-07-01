import styled from "@emotion/styled"
import { theme } from "theme"

export const SPoolDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;

  border: 1px solid rgba(152, 176, 214, 0.27);
  border-radius: ${theme.borderRadius.medium}px;
  background-color: ${theme.colors.darkBlue700};

  @media${theme.viewport.gte.sm} {
    padding: 18px 30px 30px;
  }
`

export const SValuesContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-column-gap: 14px;
  grid-row-gap: 16px;

  padding-top: 12px;

  @media (${theme.viewport.gte.sm}) {
    display: flex;
    justify-content: space-between;

    padding-top: 0;
  }
`

export const SValue = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  @media (${theme.viewport.gte.sm}) {
    align-items: flex-start;
  }
`

export const SXYKRateContainer = styled.div`
  display: flex;
  padding: 8px;
  align-items: center;
  gap: 4px;

  background: rgba(${theme.rgbColors.white}, 0.03);

  border-radius: 4px;
`
