import styled from "@emotion/styled"
import { theme } from "theme"
import { css } from "@emotion/react"

export const SItem = styled.div`
  padding: 9px 0;
  display: flex;
  justify-content: space-between;
`

export const SBond = styled.div<{ view: "card" | "list" }>`
  width: 100%;
  padding: 30px 20px;
  border-radius: 8px;

  border: 1px solid;
  border-image-source: linear-gradient(
    180deg,
    rgba(152, 176, 214, 0.27) 0%,
    rgba(163, 177, 199, 0.15) 66.67%,
    rgba(158, 167, 180, 0.2) 100%
  );

  background: linear-gradient(
      180deg,
      rgba(152, 176, 214, 0.27) 0%,
      rgba(163, 177, 199, 0.15) 66.67%,
      rgba(158, 167, 180, 0.2) 100%
    ),
    linear-gradient(0deg, #111320, #111320);

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
        grid-template-columns: repeat(4, 1fr) 150px;
        padding: 16px 30px;
        align-items: center;
        column-gap: 16px;

        ${SItem} + ${SItem} {
          border: none;
        }

        ${SItem} {
          display: block;
        }
      `}
  }
`
