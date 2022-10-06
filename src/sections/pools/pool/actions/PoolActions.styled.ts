import styled from "@emotion/styled"
import { ButtonTransparent } from "components/Button/Button"
import { theme } from "theme"

export const SButtonOpen = styled(ButtonTransparent)<{ isActive: boolean }>`
  width: 34px;
  height: 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: ${({ isActive }) =>
    isActive ? theme.colors.primary200 : theme.colors.neutralGray200};
  background-color: ${({ isActive }) =>
    isActive
      ? `rgba(${theme.rgbColors.primary450}, 0.12)`
      : theme.colors.backgroundGray700};

  border-radius: 9999px;
  transition: all 0.3s ease-in-out;
  transform: ${({ isActive }) => isActive && "rotate(180deg)"};

  &:hover {
    background-color: ${({ isActive }) =>
      !isActive && theme.colors.backgroundGray500};
  }

  &:disabled,
  &[disabled] {
    color: ${theme.colors.neutralGray500};
    background-color: ${theme.colors.backgroundGray800};
  }
`
