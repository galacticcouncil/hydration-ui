import styled from "@emotion/styled"
import { ButtonTransparent } from "components/Button/Button"
import { theme } from "theme"
import { ChipProps } from "./Chip"
import { css } from "@emotion/react"

export const SChip = styled(ButtonTransparent)<ChipProps>`
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

  ${({ onClick }) =>
    onClick
      ? css`
          cursor: pointer;
          :hover {
            background: rgba(133, 209, 255, 0.2);
          }
        `
      : css`
          cursor: default;
        `}

  ${({ disabled }) =>
    disabled &&
    `
        pointer-events: none;
        color: rgba(255, 255, 255, 0.4);
        border: transparent;
      `}
`
