import styled from "@emotion/styled"
import { ButtonTransparent } from "components/Button/Button"
import { theme } from "theme"

export const SItems = styled.div`
  overflow: auto;

  @media ${theme.viewport.gte.sm} {
    max-height: 360px;
  }
`

export const SItem = styled(ButtonTransparent)<{ isActive?: boolean }>`
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-column-gap: 8px;
  align-items: center;

  width: 100%;
  padding: 10px 20px;

  color: ${theme.colors.whiteish500};

  background-color: rgba(${theme.rgbColors.white}, 0.03);
  ${({ isActive }) =>
    isActive && `background-color: rgba(${theme.rgbColors.primaryA15}, 0.12);`}

  transition: all 0.15s ease-in-out;

  &:hover {
    color: ${theme.colors.white};
    ${({ isActive }) =>
      !isActive &&
      `:hover {
          background-color: rgba(${theme.rgbColors.white}, 0.05)
        }`}
  }

  border-top: 1px solid ${theme.colors.darkBlue401};
`

export const SItemFiat = styled(SItem)`
  grid-template-columns: 1fr auto;
  padding: 13px 20px;

  ${({ isActive }) => !isActive && `background-color: transparent;`}
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

export const SItemsHeader = styled.div`
  display: flex;
  justify-content: space-between;

  padding: 6px 20px;

  border-left: none;
  border-right: none;
  border-top: 1px solid ${theme.colors.darkBlue401};

  background-color: rgba(${theme.rgbColors.white}, 0.03);
`

export const SItemsFiatHeader = styled(SItemsHeader)`
  background: transparent;
`
