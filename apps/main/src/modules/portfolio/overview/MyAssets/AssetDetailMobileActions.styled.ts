import { css, styled } from "@galacticcouncil/ui/utils"

export const SAssetDetailMobileActions = styled.div(
  ({ theme }) => css`
    padding-top: ${theme.space.base};
    padding-bottom: var(--modal-body-padding);

    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;

    row-gap: ${theme.space.m};
    column-gap: ${theme.space.base};

    position: sticky;
    bottom: 0;
    background: var(--modal-background);
  `,
)
