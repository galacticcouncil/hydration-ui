import { css, styled } from "@galacticcouncil/ui/utils"

export const SShareTransferAssetOption = styled.button(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.space.m};
    width: 100%;
    padding: ${theme.space.l} var(--modal-content-padding);
    border: 0;
    border-top: 1px solid ${theme.details.separators};
    background: transparent;
    color: ${theme.text.high};
    font: inherit;
    text-align: left;
    cursor: pointer;

    &:hover,
    &[aria-selected="true"] {
      background: ${theme.surfaces.containers.dim.dimOnBg};
    }
  `,
)
