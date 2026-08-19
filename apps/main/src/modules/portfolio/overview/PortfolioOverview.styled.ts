import { Box, Button, Paper, Stack } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SPortfolioChainHeaderButton = styled.button<{
  readonly isExpandable?: boolean
}>(
  ({ theme, isExpandable }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding-left: ${theme.space.primary};
    padding-right: ${theme.space.quart};
    padding-block: ${theme.space.m};
    background: ${theme.surfaces.containers.dim.dimOnBg};
    border-bottom: 1px solid ${theme.details.separators};
    border-top: 1px solid ${theme.details.separators};
    box-sizing: border-box;
    color: ${theme.text.high};
    cursor: pointer;
    transition: ${theme.transitions.colors};

    &:hover {
      background: ${theme.surfaces.containers.high.hover};
    }

    svg {
      transition: transform 0.15s ease;
    }

    &[data-state="closed"] {
      border-bottom-color: transparent;
    }

    &[data-state="open"] svg {
      transform: rotate(180deg);
    }

    ${!isExpandable &&
    css`
      pointer-events: none;
    `}
  `,
)

export const STrackedWalletHeader = styled.div<{
  readonly "data-state"?: "open" | "closed"
}>(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding-left: ${theme.space.primary};
    padding-right: ${theme.space.quart};
    padding-block: ${theme.space.m};
    background: ${theme.surfaces.containers.dim.dimOnBg};
    border-bottom: 1px solid ${theme.details.separators};
    border-top: 1px solid ${theme.details.separators};
    box-sizing: border-box;
    color: ${theme.text.high};
    cursor: pointer;
    transition: ${theme.transitions.colors};

    &:hover {
      background: ${theme.surfaces.containers.high.hover};
    }

    &[data-state="closed"] {
      border-bottom-color: transparent;
    }

    &[data-state="open"] [data-chevron] svg {
      transform: rotate(180deg);
    }
  `,
)

export const STrackedWalletHeaderIdentity = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.space.s};
    min-width: 0;

    &:hover [data-remove],
    &:focus-within [data-remove] {
      opacity: 1;
      pointer-events: auto;
    }
  `,
)

export const STrackedWalletHeaderMainTrigger = styled.div(
  () => css`
    display: flex;
    align-items: center;
    min-width: 0;
    text-align: left;
  `,
)

export const STrackedWalletHeaderChevronTrigger = styled.span(
  () => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;

    svg {
      transition: transform 0.15s ease;
    }
  `,
)

export const STrackedWalletHeaderRefreshButton = styled(Button)(
  ({ theme }) => css`
    height: ${theme.sizes.xl};
    width: ${theme.sizes.xl};
    min-width: ${theme.sizes.xl};
    padding: 0;
    margin-block: -${theme.space.xl};

    [disabled] {
      opacity: 1;
    }
  `,
)

export const STrackedWalletHeaderRemoveButton = styled.button(
  ({ theme }) => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: ${theme.text.medium};
    cursor: pointer;
    opacity: 0;
    pointer-events: none;
    transition: ${theme.transitions.opacity}, ${theme.transitions.colors};

    &:hover:not(:disabled) {
      color: ${theme.text.high};
    }

    @media (hover: none) {
      opacity: 1;
      pointer-events: auto;
    }
  `,
)

export const SPortfolioChainHeaderTotal = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-height: calc(${theme.fontSizes.p6} * 1.4);
    font-size: ${theme.fontSizes.p6};
    line-height: 1.4;
  `,
)

const portfolioChainHeaderButtonCss = css`
  scroll-margin-top: calc(3.375rem + 1rem);
  & > *:first-of-type > [data-state] {
    border-top-color: transparent;
  }
`

export const SPortfolioPaper = styled(Paper)(
  () => css`
    overflow: hidden;
    ${portfolioChainHeaderButtonCss}
  `,
)

export const SPortfolioChainsList = styled(Box)(
  () => css`
    ${portfolioChainHeaderButtonCss}
  `,
)

export const SPortfolioOverviewStats = styled(Stack)(
  ({ theme }) => css`
    width: max-content;
    justify-content: flex-start;

    ${mq("lg")} {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      width: 100%;
      align-items: start;
      column-gap: ${theme.space.xxl};
    }
  `,
)

export const SPortfolioOverviewStat = styled(Box)(
  ({ theme }) => css`
    flex-shrink: 0;

    ${mq("lg")} {
      min-width: 0;
      padding-right: ${theme.space.xxl};
      border-right: 1px solid ${theme.details.separators};

      &:last-child {
        padding-right: 0;
        border-right: none;
      }

      & > div > div:nth-of-type(2),
      & > div > div > div:nth-of-type(2) {
        min-height: ${theme.fontSizes.h7};
      }
    }
  `,
)

export const SPortfolioClaimButton = styled(Button)(
  ({ theme }) => css`
    padding: 0 ${theme.buttons.paddings.primary};
    border-radius: ${theme.containers.cornerRadius.buttonsPrimary};
  `,
)

export const SPortfolioTableWrapper = styled.div(
  ({ theme }) => css`
    overflow: hidden;

    & table {
      background-color: transparent;
    }

    & thead,
    & tbody,
    & tr,
    & td,
    & th {
      background-color: transparent;
    }

    & tbody tr {
      border-top-color: ${theme.details.separators};
    }

    & tbody tr:not([data-empty-state]):hover,
    & tbody tr:not([data-empty-state]):hover td,
    & [data-expanded="true"],
    & [data-expanded="true"] td {
      background-color: ${theme.surfaces.containers.high.hover};
      transition: ${theme.transitions.colors};
    }
  `,
)
