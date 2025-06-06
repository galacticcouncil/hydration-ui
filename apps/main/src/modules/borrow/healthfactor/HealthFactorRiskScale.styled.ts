import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const SContainer = styled.div`
  position: relative;
  margin-top: 40px;
  margin-bottom: 16px;
`

export const SHealthFactorBar = styled.div(
  ({ theme }) => css`
    height: 4px;
    background: ${`linear-gradient(90deg, ${theme.accents.success.emphasis} 60%, ${theme.accents.alert.primary} 80%, ${theme.accents.danger.emphasis} 100%)`};
    border-radius: 4px;
    transform: matrix(-1, 0, 0, 1, 0, 0);
  `,
)

export const SCurrentValueWrapper = styled.div<{ position: number }>`
  position: absolute;
  bottom: calc(100% + 6px);
  left: ${({ position }) => (position > 100 ? 100 : position)}%;
  z-index: 3;
`

export const SCurrentValueMarker = styled.div<{ position: number }>`
  position: relative;
  white-space: nowrap;

  &::after {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 6px 4px 0 4px;
    border-color: currentColor transparent transparent transparent;
    left: ${({ position }) => (position > 75 ? "auto" : "50%")};
    right: ${({ position }) => (position > 75 ? "0" : "auto")};
    transform: ${({ position }) =>
      position > 75 ? "translateX(0)" : "translateX(-50%)"};
  }
`

export const SLiquidationMarker = styled.div(
  ({ theme }) => css`
    padding-block: 4px;

    &::after {
      content: "";
      position: absolute;
      bottom: 85%;
      left: 10%;
      transform: translateX(-50%);
      height: 10px;
      width: 2px;
      background-color: ${theme.accents.danger.emphasis};
    }
  `,
)
