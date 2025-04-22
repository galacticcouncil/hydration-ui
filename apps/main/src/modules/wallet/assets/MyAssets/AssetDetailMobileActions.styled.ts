import { css, styled } from "@galacticcouncil/ui/utils"

export const SAssetDetailMobileActions = styled.div(
  ({ theme }) => css`
    padding-top: ${theme.scales.paddings.base}px;

    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;

    row-gap: ${theme.scales.paddings.m}px;
    column-gap: 8px;
  `,
)
