import { css, styled } from "@galacticcouncil/ui/utils"

export const STransactionItem = styled.div(
  ({ theme }) => css`
    padding-block: ${theme.containers.paddings.quint};

    display: flex;
    justify-content: space-between;
  `,
)
