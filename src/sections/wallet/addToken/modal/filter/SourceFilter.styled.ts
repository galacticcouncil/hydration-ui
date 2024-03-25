import styled from "@emotion/styled"
import { ButtonTransparent } from "components/Button/Button"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 0 12px;

  @media ${theme.viewport.gte.sm} {
    margin: 12px 20px;
  }
`

export const SFilterButton = styled(ButtonTransparent)<{
  active?: boolean
  disabled?: boolean
}>`
  display: flex;
  align-items: center;
  gap: 6px;

  padding: 6px 12px;
  height: 100%;

  font-size: 14px;
  color: ${theme.colors.white};

  background: ${({ active }) =>
    active ? "rgba(133, 209, 255, 0.2)" : "rgba(255, 255, 255, 0.03)"};

  border-radius: 9999px;
  border: 1px solid
    ${({ active }) =>
      active ? "rgba(133, 209, 255, 0.5)" : "rgba(255, 255, 255, 0.03)"};

  :hover {
    background: rgba(133, 209, 255, 0.2);
  }

  ${({ disabled }) =>
    disabled &&
    `
      pointer-events: none;
      color: rgba(255, 255, 255, 0.4);
      border: transparent;
    `}
`
