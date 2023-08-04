import styled from "@emotion/styled"
import { css } from "@emotion/react"
import { theme } from "theme"

export const Outer = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;

  border: 1px solid rgba(153, 155, 167, 1);
  background-color: rgba(84, 99, 128, 0.35);

  ${({ selected }) =>
    selected &&
    css`
      border-color: ${theme.colors.pink500};
      background-color: ${theme.colors.darkBlue700};
    `}
`

export const Inner = styled.div`
  background: ${theme.colors.pink700};
  width: 10px;
  height: 10px;
  border-radius: 3px;
`
