import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const STradeOptionContainer = styled.button<{ active: boolean }>(
  ({ theme, active }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;

    border: 1px solid ${theme.buttons.outlineDark.onOutline};
    border-radius: 8px;

    padding: 16px 12px;

    cursor: pointer;

    transition: ${theme.transitions.colors};

    &:hover {
      ${!active &&
      css`
        background-color: ${theme.buttons.outlineDark.rest};
      `}
    }

    ${active &&
    css`
      background-color: ${theme.buttons.secondary.outline.fill};
      border-color: ${theme.buttons.secondary.outline.outline};
    `}

    &[disabled] {
      cursor: unset;
    }
  `,
)
