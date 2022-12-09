import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { IconButton } from "components/IconButton/IconButton"
import { theme } from "theme"

export const SButtonOpen = styled(IconButton)<{
  isActive?: boolean
  disabled?: boolean
}>`
  width: 34px;
  height: 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: ${theme.colors.white};

  ${({ isActive }) =>
    isActive &&
    css`
      border: none;
      background-color: rgba(${theme.rgbColors.primaryA15}, 0.12);
      color: ${theme.colors.brightBlue200};
    `}

  &:disabled,
  &[disabled] {
    border: none;

    color: ${theme.colors.darkBlue300};
    background-color: rgba(${theme.rgbColors.primaryA06}, 0.06);

    cursor: not-allowed;
  }

  > * {
    transition: all ${theme.transitions.default};
    transform: ${({ isActive }) => isActive && "rotate(180deg)"};
  }
`

export const SActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;

  margin: 24px 0px;

  @media (${theme.viewport.gte.sm}) {
    margin: 0;
    width: 100%;
  }
`
