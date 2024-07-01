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
  gap: 20px;
  align-items: stretch;
  flex-direction: column;
  flex: 1 0 0;

  position: relative;

  padding: 12px;
  padding-right: 22px;

  border-radius: 4px;
  border: 1px solid rgba(${theme.rgbColors.primaryA15Blue}, 0.35);
  background-color: rgba(${theme.rgbColors.alpha0}, 0.12);

  transition: all ${theme.transitions.default};

  outline: none;

  @media ${theme.viewport.gte.sm} {
    padding: 12px 30px 12px 20px;
  }

  ${({ isClickable }) =>
    isClickable &&
    css`
      cursor: pointer;

      &:hover {
        border: 1px solid ${theme.colors.brightBlue500};
      }
    `}
  }}
`

export const SRow = styled.div<{ compact?: boolean }>`
  display: grid;
  grid-template-columns: ${({ compact }) => (compact ? "auto" : "2fr")} 3fr;
  grid-column-gap: ${({ compact }) => (compact ? "8px" : "12px")};
  align-items: center;
  justify-content: space-between;

  padding: 10px 0;

  border-top: 1px solid rgba(${theme.rgbColors.white}, 0.06);
`

export const SIcon = styled(Icon)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  margin: auto 0;
`
