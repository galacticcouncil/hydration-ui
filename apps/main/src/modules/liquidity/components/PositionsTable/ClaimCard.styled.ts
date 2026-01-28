import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const SClaimCard = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;

    flex-grow: 1;

    background: ${theme.accents.success.dim};
    border-radius: ${theme.containers.cornerRadius.internalPrimary};

    padding: ${theme.containers.paddings.tertiary};
  `}
`
