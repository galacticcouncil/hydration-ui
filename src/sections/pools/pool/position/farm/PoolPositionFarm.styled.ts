import styled from "styled-components"
import { theme } from "theme"

export const SContainer = styled.div<{ isHighlighted?: boolean }>`
  display: grid;
  grid-template-columns: auto 1fr 120px;
  grid-column-gap: 8px;
  align-items: center;

  padding: 10px 12px;

  border-radius: 12px;
  ${({ isHighlighted }) =>
    isHighlighted &&
    `background-color: rgba(${theme.rgbColors.primary100}, 0.12);`}
`
