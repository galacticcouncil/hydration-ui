import styled from "@emotion/styled"
import { ButtonTransparent } from "components/Button/Button"
import { theme } from "theme"

export const SFaqListContainer = styled.div`
  display: flex;
  flex-direction: column;

  background: ${theme.colors.darkBlue700};
  border-radius: 8px;

  border: 1px solid ${theme.colors.darkBlue400};
`

export const SFaqListItem = styled.div`
  display: flex;
  flex-direction: column;

  border-bottom: 1px solid ${theme.colors.darkBlue400};
  &:last-of-type {
    border-bottom: none;
  }
`

export const SFaqListItemToggle = styled(ButtonTransparent)`
  width: 100%;
  padding: 10px 20px;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  text-align: left;

  cursor: pointer;

  color: ${theme.colors.white};

  &:hover,
  &[data-expanded="true"] {
    color: ${theme.colors.brightBlue300};
  }
`
