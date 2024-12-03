import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const SChip = styled.span(({ theme }) => [
  css`
    display: inline-flex;
    height: ${theme.paragraphSize.p6};
    padding: ${theme.containers.paddings.tertiary}
      ${theme.containers.paddings.quart};
    align-items: center;
    gap: 4px;
    flex-shrink: 0;

    border-radius: ${theme.containers.cornerRadius.buttonsPrimary};
  `,
])
