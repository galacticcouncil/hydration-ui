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
    transition: ${theme.transitions.colors};

    &:hover {
      background: ${theme.surfaces.containers.high.hover};
    }

    &[data-state="closed"] {
      border-bottom-color: transparent;
    }
  `,
)

export const STrackedWalletHeaderMainTrigger = styled.button(
  () => css`
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
    text-align: left;
  `,
)

export const STrackedWalletHeaderChevronTrigger = styled.button(
  () => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;

    svg {
      transition: transform 0.15s ease;
    }

    &[data-state="open"] svg {
      transform: rotate(180deg);
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
  & > *:first-child > [data-state] {
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
    min-width: 0;

    ${mq("lg")} {
      padding-right: ${theme.space.xxl};
      border-right: 1px solid ${theme.details.separators};

      &:last-child {
        padding-right: 0;
        border-right: none;
      }

      /* reserve the value line height so skeleton ↔ text swaps don't resize the row */
      & > div > div:nth-child(2),
      & > div > div > div:nth-child(2) {
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

    & tbody tr:hover,
    & tbody tr:hover td,
    & [data-expanded="true"],
    & [data-expanded="true"] td {
      background-color: ${theme.surfaces.containers.high.hover};
      transition: ${theme.transitions.colors};
    }
  `,
)
