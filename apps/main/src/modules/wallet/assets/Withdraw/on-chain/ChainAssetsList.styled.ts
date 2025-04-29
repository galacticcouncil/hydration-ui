import { css, styled } from "@galacticcouncil/ui/utils"

export const SChainAssetsListContainer = styled.div(
  ({ theme }) => css`
    --chain-assets-padding-inline: ${theme.containers.paddings.primary}px;
    display: grid;
    grid-template-columns: 1fr auto;
    column-gap: 10px;

    padding-inline: var(--chain-assets-padding-inline);

    & > * {
      grid-column: 1 / -1;
    }
  `,
)

export const SChainAssetsListHeader = styled.div(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: subgrid;

    padding-top: ${theme.scales.paddings.m}px;
    padding-bottom: ${theme.scales.paddings.s}px;

    color: ${theme.text.medium};
  `,
)

export const SChainAssetsList = styled.div`
  display: grid;
  grid-template-columns: subgrid;
`

export const SChainAssetsListItem = styled.div`
  grid-column: 1 / -1;

  display: grid;
  grid-template-columns: subgrid;
  align-items: center;

  padding-block: 12px;
  cursor: pointer;
`
