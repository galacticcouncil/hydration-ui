import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const SOption = styled.div<{ highlighted: boolean }>(
  ({ theme, highlighted }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;

    padding: 0 var(--modal-content-padding);
    height: 100%;

    border-top: 1px solid ${theme.details.separators};

    cursor: pointer;

    ${highlighted &&
    css`
      background: ${theme.surfaces.containers.dim.dimOnBg};
    `}
  `,
)
