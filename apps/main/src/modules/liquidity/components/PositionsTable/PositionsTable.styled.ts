import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const STableHeader = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.space.s};

    position: sticky;

    left: 0;
    padding: ${theme.containers.paddings.tertiary}
      ${theme.containers.paddings.tertiary} 0px;
  `}
`
