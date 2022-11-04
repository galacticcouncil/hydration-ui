import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div<{ isMultiple?: boolean }>`
  display: grid;
  grid-column-gap: 8px;

  ${({ isMultiple }) => {
    if (isMultiple) {
      return {
        marginTop: 12,
        justifyItems: "flex-end",
        gridTemplateColumns: "1fr",
      }
    }

    return { gridTemplateColumns: "1fr 1fr 1fr 2fr" }
  }}
`

export const SInnerContainer = styled.div`
  display: grid;
  grid-template-columns: auto 1fr 120px;
  border-radius: 12px;
  align-items: center;
  background: rgba(${theme.rgbColors.primary100}, 0.06);
  grid-column: 4;

  padding: 8px 12px;
  gap: 8px;
`
