import styled from "@emotion/styled"
import { css } from "@emotion/react"
import { theme } from "theme"
import { MouseEventHandler } from "react"

export const SBlock = styled.div<{
  selected: boolean
  onClick?: MouseEventHandler<HTMLDivElement>
}>`
  user-select: none;
  border-radius: 4px;
  padding: 24px 22px 42px 24px;

  border: 1px solid rgba(51, 55, 80, 1);
  margin-top: 10px;

  ${({ onClick }) =>
    !!onClick &&
    css`
      cursor: pointer;
    `}

  ${({ selected }) =>
    selected &&
    css`
      border-color: ${theme.colors.darkBlue700};
      background: linear-gradient(
        0deg,
        rgba(252, 64, 140, 0.7) 0%,
        #111320 100%
      );
    `}
`
