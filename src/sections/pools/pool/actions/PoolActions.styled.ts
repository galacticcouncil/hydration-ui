import styled from "@emotion/styled"
import { IconButton } from "components/IconButton/IconButton"
import { theme } from "theme"

export const SButtonOpen = styled(IconButton)<{
  isActive?: boolean
  disabled?: boolean
}>`
  width: 41px;
  height: 41px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #bdccd4;

  &:disabled,
  &[disabled] {
    color: ${theme.colors.darkBlue300};
    background: rgba(${theme.rgbColors.alpha0}, 0.06);

    border: 1px solid ${theme.colors.darkBlue300};

    opacity: 0.7;

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
    width: 340px;
  }
`
