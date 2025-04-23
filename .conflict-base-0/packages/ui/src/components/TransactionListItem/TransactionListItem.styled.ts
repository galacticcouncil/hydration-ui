import { css, styled } from "@/utils"

export const STransactionListItem = styled.div(
  ({ theme }) => css`
    padding-block: ${theme.containers.paddings.quint}px;

    display: flex;
    justify-content: space-between;
  `,
)
