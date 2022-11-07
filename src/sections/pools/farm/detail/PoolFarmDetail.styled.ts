import styled from "@emotion/styled"
import { css } from "@emotion/react"
import { theme } from "theme"

export const SFarm = styled.button<{
  variant: "list" | "detail"
  isJoined?: boolean
}>`
  display: grid;
  grid-row-gap: 18px;
  grid-column-gap: 4px;
  grid-template-columns: 95% auto;
  > *:nth-of-type(1) {
    grid-area: ${({ isJoined }) =>
      isJoined ? "1 / 1 / 2 / 2" : "1 / 1 / 2 / 2"};
  }
  > *:nth-of-type(2) {
    grid-area: ${({ isJoined }) =>
      isJoined ? "2 / 1 / 3 / 2" : "2 / 1 / 3 / 2"};
  }
  > *:nth-of-type(3) {
    grid-area: ${({ isJoined }) =>
      isJoined ? "3 / 1 / 4 / 2" : "1 / 2 / 3 / 3"};
  }
  > *:nth-of-type(4) {
    grid-area: 1 / 2 / 4 / 3;
  }

  width: 100%;

  padding: 16px 20px;

  border-radius: 12px;
  background-color: ${theme.colors.backgroundGray1000};

  transition: all ${theme.transitions.default};

  outline: none;
  border: 1px solid transparent;

  svg {
    width: 20px;
    height: 20px;
  }

  @media (${theme.viewport.gte.sm}) {
    padding: 20px 24px;

    grid-column-gap: 32px;
    > *:nth-of-type(1) {
      grid-area: ${({ isJoined }) =>
        isJoined ? "1 / 1 / 2 / 2" : "1 / 1 / 4 / 2"};
    }
    > *:nth-of-type(2) {
      grid-area: ${({ isJoined }) =>
        isJoined ? "2 / 1 / 4 / 2" : "1 / 2 / 4 / 3"};
    }
    > *:nth-of-type(3) {
      grid-area: ${({ isJoined }) =>
        isJoined ? "1 / 2 / 4 / 3" : "1 / 3 / 4 / 4"};
    }
    > *:nth-of-type(4) {
      grid-area: 1 / 3 / 4 / 4;
    }

    ${(props) => {
      if (props.variant === "detail") {
        return css`
          grid-template-columns: auto 1fr;
        `
      }

      return css`
        grid-template-columns: 25% 60% auto;
        cursor: pointer;

        &:hover {
          border-color: ${theme.colors.primary400};
        }
      `
    }}
  }
`

export const SFarmRow = styled.div`
  display: grid;
  grid-template-columns: 92px 1fr;
  grid-column-gap: 12px;
  align-items: center;

  padding-bottom: 9px;
  margin-bottom: 9px;

  border-bottom: 2px solid ${theme.colors.backgroundGray800};
`

export const SFarmIcon = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;

  height: 100%;

  margin-right: -10px;

  svg {
    width: 24px;
    height: 24px;

    opacity: 0.5;
    transform: rotate(-90deg);

    color: ${theme.colors.neutralGray200};
  }
`
