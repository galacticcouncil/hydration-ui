import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const STableHeader = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.scales.paddings.s}px;

    position: sticky;

    left: 0;
    padding: ${theme.containers.paddings.tertiary}px
      ${theme.containers.paddings.tertiary}px 0px;
  `}
`
