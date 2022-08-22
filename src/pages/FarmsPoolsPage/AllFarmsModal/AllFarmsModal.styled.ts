import styled from "styled-components"
import { theme } from "theme"

export const StyledFarm = styled.button`
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-column-gap: 32px;

  width: 100%;

  padding: 20px 24px;

  border-radius: 12px;
  background-color: ${theme.colors.backgroundGray1000};

  transition: all 0.15s ease-in-out;
  cursor: pointer;
  outline: none;
  border: 1px solid transparent;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    border-color: ${theme.colors.primary400};
  }
`

export const StyledFarmRow = styled.div`
  display: grid;
  grid-template-columns: 88px 1fr;
  grid-column-gap: 12px;
  align-items: center;

  padding-bottom: 9px;
  margin-bottom: 9px;

  border-bottom: 2px solid ${theme.colors.backgroundGray800};
`

export const StyledFarmIcon = styled.div`
  display: flex;
  align-items: center;

  height: 100%;

  svg {
    width: 10px;
    height: 10px;

    opacity: 0.5;
    transform: rotate(-90deg);
  }
`
