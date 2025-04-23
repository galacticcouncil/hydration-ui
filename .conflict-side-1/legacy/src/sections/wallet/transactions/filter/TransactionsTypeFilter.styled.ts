import styled from "@emotion/styled"
import { ButtonTransparent } from "components/Button/Button"
import { theme } from "theme"

export const SFilterButton = styled(ButtonTransparent)<{ active?: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: white;

  padding: 0 8px;
  padding-bottom: 20px;

  color: ${({ active }) =>
    active ? theme.colors.brightBlue300 : theme.colors.darkBlue100};

  border-bottom: 1px solid
    ${({ active }) => (active ? theme.colors.brightBlue300 : "transparent")};

  opacity: ${({ active }) => (active ? 1 : 0.6)};

  :hover {
    opacity: 1;
  }
`
