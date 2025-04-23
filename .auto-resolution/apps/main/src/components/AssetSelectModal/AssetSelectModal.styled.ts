import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const SOption = styled.div<{ highlighted: boolean }>(
  ({ theme, highlighted }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;

    position: absolute;
    top: 0;
    left: 0;
    width: 100%;

    padding: 12px var(--modal-content-padding);

    border-bottom: 1px solid ${theme.details.borders};

    cursor: pointer;

    ${highlighted &&
    css`
      background: ${theme.buttons.secondary.outline.outline};
    `}
  `,
)
