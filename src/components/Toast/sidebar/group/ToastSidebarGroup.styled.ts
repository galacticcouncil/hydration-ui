import styled from "@emotion/styled"
import { ButtonTransparent } from "components/Button/Button"
import { theme } from "theme"

export const SContainer = styled.div<{ isOpen: boolean }>`
  display: grid;
  grid-template-rows: ${({ isOpen }) => (isOpen ? "1fr" : "0fr")};
  width: 100%;

  transition: grid-template-rows 0.15s ease-in-out;
`
export const SSide = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const SToggle = styled(ButtonTransparent)<{ isOpen: boolean }>`
  display: flex;
  justify-content: space-between;

  width: 100%;
  padding: 10px 22px;

  background-color: rgba(${theme.rgbColors.primaryA06}, 0.06);

  svg {
    rotate: ${({ isOpen }) => (!isOpen ? "0deg" : "180deg")};
    transition: all 0.15s ease-in-out;
  }
`
