import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { theme } from "theme"

type WarningMessageVariant = "pink" | "gradient"

const getStylesByVariant = (variant: WarningMessageVariant) => {
  switch (variant) {
    case "pink":
      return css`
        background: #dfb1f3;
        color: #240e32;
      `
    case "gradient":
      return css`
        background: linear-gradient(90deg, #ff1f7a 41.09%, #57b3eb 100%);
        color: ${theme.colors.white};
      `
  }
}

export const SWarningMessageContainer = styled.div<{
  variant?: WarningMessageVariant
}>`
  ${({ variant = "gradient" }) => getStylesByVariant(variant)}

  width: 100%;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  padding: 8px;
  z-index: ${theme.zIndices.header};
`

export const SWarningMessageContent = styled.div`
  display: flex;
  flex-direction: row;

  gap: 8px;
  align-items: center;
  justify-content: center;
`

export const SSecondaryItem = styled.div`
  display: flex;
  flex: 1 1 0%;
  flexbasis: 0;
`
