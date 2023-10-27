import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div<{ hasChain: boolean }>`
  display: grid;
  gap: 12px;

  @media ${theme.viewport.gte.sm} {
    gap: 30px;
  }

  ${({ hasChain }) => {
    const cols = hasChain ? 3 : 2
    return `
      grid-template-columns: repeat(${cols}, 1fr);

      & > div {
        &:not(:nth-child(3n)) {
          border-right: 1px solid rgba(255, 255, 255, 0.12);
        }

        &:not(:has(p)) {    
          display: ${hasChain ? "block" : "none"};
          border-right: none !important;
        }

        @media ${theme.viewport.gte.sm} {
          padding: 0 35px;
        }
      }
    `
  }}
`
