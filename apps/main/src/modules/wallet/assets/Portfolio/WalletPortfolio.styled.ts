import { Button } from "@galacticcouncil/ui/components"
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

    &[data-state="open"] svg {
      transform: rotate(180deg);
    }

    ${!isExpandable &&
    css`
      pointer-events: none;
    `}
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
