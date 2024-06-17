import styled from "@emotion/styled"
import { Icon } from "components/Icon/Icon"
import { theme } from "theme"
import { css } from "@emotion/react"

export const SContainer = styled.div<{
  isClickable: boolean
  isJoined?: boolean
}>`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: stretch;
  flex-direction: column;

  position: relative;

  padding: 12px;
  padding-right: 22px;

  border-radius: 4px;
  background-color: rgba(${theme.rgbColors.alpha0}, 0.12);

  transition: all ${theme.transitions.default};

  outline: none;
  border: 1px solid transparent;

  ${({ isClickable }) => {
    if (!isClickable) {
      return css`
        @media ${theme.viewport.gte.sm} {
          flex-direction: row;
          padding: 20px 30px;
        }
      `
    }

    return css`
      cursor: pointer;

      @media ${theme.viewport.gte.sm} {
        flex-direction: row;
        padding: 20px 30px;
      }

      &:hover {
        border: 1px solid ${theme.colors.brightBlue500};
      }
    `
  }}
`

export const SRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 3fr;
  grid-column-gap: 12px;
  align-items: center;
  justify-content: space-between;

  padding-bottom: 9px;
  margin-bottom: 9px;

  border-bottom: 2px solid rgba(${theme.rgbColors.white}, 0.06);
`

export const SIcon = styled(Icon)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  margin: auto 0;
`
