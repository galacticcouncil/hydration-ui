import { css, styled } from "@galacticcouncil/ui/utils"

export const SAddressBook = styled.div(
  ({ theme }) => css`
    padding-block: ${theme.containers.paddings.primary}px;

    display: flex;
    flex-direction: column;
    gap: ${theme.scales.paddings.m}px;
  `,
)
