import styled from "@emotion/styled"
import { theme } from "theme"

export const SAssetRow = styled.div<{ isSelected: boolean }>`
  display: flex;
  justify-content: space-between;

  border-bottom: 1px solid ${theme.colors.darkBlue401};

  padding: 17px 12px;

  transition: ${theme.transitions.slow};
  cursor: pointer;

  @media ${theme.viewport.gte.sm} {
    padding: 17px 20px;
  }

  &:hover {
    background: rgba(${theme.rgbColors.white}, 0.06);
  }

  &:active {
    background: rgba(${theme.rgbColors.white}, 0.07);
  }

  ${({ isSelected }) =>
    isSelected && `background: rgba(${theme.rgbColors.white}, 0.06)`}
`

export const SCircle = styled.div<{ isActive: boolean }>`
  position: relative;

  width: 14px;
  height: 14px;

  border-radius: 50%;
  border: 1px solid ${theme.colors.darkBlue400};

  &::before {
    display: ${({ isActive }) => (isActive ? "block" : "none")};
    content: "";
    position: absolute;
    inset: 1px;

    background-color: ${theme.colors.brightBlue700};
    border-radius: 50%;
  }
`
