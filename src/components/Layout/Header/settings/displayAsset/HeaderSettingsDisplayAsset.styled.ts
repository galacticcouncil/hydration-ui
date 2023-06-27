import styled from "@emotion/styled"
import { ButtonTransparent } from "components/Button/Button"
import { theme } from "theme"

export const SItems = styled.div`
  max-height: 360px;
  overflow: auto;
`

export const SItem = styled(ButtonTransparent)<{ isActive?: boolean }>`
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-column-gap: 8px;
  align-items: center;

  width: 100%;
  padding: 10px 20px;

  color: ${theme.colors.whiteish500};
  ${({ isActive }) =>
    isActive && `background-color: rgba(${theme.rgbColors.primaryA15}, 0.12);`}

  transition: all 0.15s ease-in-out;

  &:hover {
    color: ${theme.colors.white};
  }

  &:not(:last-of-type) {
    border-bottom: 1px solid ${theme.colors.darkBlue401};
  }
`

export const SItemUSD = styled(SItem)`
  grid-template-columns: 1fr auto;
  padding: 13px 20px;
`

export const SCircle = styled.div<{ isActive: boolean }>`
  position: relative;

  width: 14px;
  height: 14px;

  border-radius: 50%;
  border: 1px solid ${theme.colors.basic100};

  &::before {
    display: ${({ isActive }) => (isActive ? "block" : "none")};
    content: "";
    position: absolute;
    inset: 1px;

    background-color: ${theme.colors.brightBlue700};
    border-radius: 50%;
  }
`
