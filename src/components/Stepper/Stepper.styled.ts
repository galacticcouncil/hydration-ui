import styled from "@emotion/styled"
import { theme } from "theme"

export const SStepperContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  @media (${theme.viewport.gte.sm}) {
    width: 222px;
  }
`

export const SCircle = styled.div`
  display: block;
  width: 26px;
  height: 26px;

  border-radius: 9999px;
  border: 1px solid ${theme.colors.basic500};

  transition: all ${theme.transitions.default};
  flex-shrink: 0;

  display: flex;
  justify-content: center;
  align-items: center;
`

export const SThumbContainer = styled.div<{ isDone?: boolean }>`
  width: 18px;
  height: 18px;

  border-radius: 9999px;

  background: ${({ isDone }) =>
    isDone
      ? `rgba(${theme.rgbColors.primaryA15}, 0.12);`
      : theme.colors.brightBlue700};

  display: flex;
  justify-content: center;
  align-items: center;
`

export const SStepperLine = styled.div`
  height: 1px;

  flex-grow: 1;

  background: ${theme.colors.basic500};

  margin: 0 3px;
`
