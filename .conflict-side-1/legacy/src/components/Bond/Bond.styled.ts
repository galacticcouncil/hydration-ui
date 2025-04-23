import styled from "@emotion/styled"
import { theme } from "theme"
import { css } from "@emotion/react"
import { BondView } from "./Bond"

export const SItem = styled.div`
  padding: 9px 0;
  display: flex;
  justify-content: space-between;
`

export const SBond = styled.div<{ view: BondView }>`
  ${theme.gradientBorder};

  width: 100%;
  padding: 30px 20px;
  border-radius: 8px;

  background: ${theme.colors.darkBlue700};
  box-shadow: 3px 4px 0px 0px rgba(102, 181, 255, 0.19);

  display: grid;
  grid-template-columns: 1fr;

  ${SItem} + ${SItem} {
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  @media ${theme.viewport.gte.sm} {
    padding: 30px;

    ${({ view }) =>
      view === "list" &&
      css`
        display: flex;
        padding: 16px 30px;
        align-items: center;
        column-gap: 16px;

        ${SItem} + ${SItem} {
          border: none;
        }

        ${SItem} {
          display: flex;
          flex-flow: column;
          gap: 4px;
        }
      `}
  }
`
