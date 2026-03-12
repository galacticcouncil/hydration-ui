import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { getToken } from "@galacticcouncil/ui/utils"

export const SGrid = styled.div(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: 1fr;
    gap: ${theme.space.l};

    @media (min-width: 640px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 1024px) {
      grid-template-columns: repeat(4, 1fr);
    }
  `,
)

export const SCard = styled.div(
  ({ theme }) => css`
    background: ${getToken("container.primary.background")};
    border: 1px solid ${getToken("container.primary.border")};
    border-radius: ${theme.containers.cornerRadius.containersPrimary};
    padding: ${theme.space.l};
    display: flex;
    flex-direction: column;
    gap: ${theme.space.base};
    cursor: pointer;
    transition: border-color 0.2s;

    &:hover {
      border-color: ${getToken("container.primary.borderHover")};
    }
  `,
)

export const SCardHeader = styled.div(
  ({ theme }) => css`
    display: flex;
    justify-content: flex-end;
    margin-bottom: ${theme.space.l};
    min-height: 90px;
    position: relative;
  `,
)

export const SIconWrapper = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
`

export const SBadge = styled.div(
  ({ theme }) => css`
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    background: rgba(16, 185, 129, 0.15);
    color: ${getToken("state.success.default")};
    height: fit-content;
  `,
)

export const SApyRow = styled.div(
  ({ theme }) => css`
    display: flex;
    gap: ${theme.space.xl};
    padding-top: ${theme.space.base};
  `,
)

export const SApyStat = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.xs};
  `,
)
