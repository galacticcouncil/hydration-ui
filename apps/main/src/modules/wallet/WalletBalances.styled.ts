import { css, styled } from "@galacticcouncil/ui/utils"

export const WalletBalancesContainer = styled.div(
  ({ theme }) => css`
    padding: 20px;

    display: flex;
    gap: 20px;

    background: ${theme.surfaces.containers.high.primary};
    border: 1px solid ${theme.details.borders};
    border-radius: 16px;
  `,
)
