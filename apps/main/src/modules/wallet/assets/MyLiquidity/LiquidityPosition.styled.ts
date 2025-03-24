import { css, styled } from "@galacticcouncil/ui/utils"

export const SLiquidityPosition = styled.div(
  ({ theme }) => css`
    padding-block: ${theme.containers.paddings.tertiary}px;
    padding-inline: ${theme.containers.paddings.primary}px;

    display: flex;
    gap: ${theme.containers.paddings.tertiary}px;
    justify-content: space-between;
    align-items: center;

    background: ${theme.controls.dim.base};
    border: 1px solid ${theme.details.borders};
    border-radius: ${theme.containers.cornerRadius.containersPrimary}px;
  `,
)
