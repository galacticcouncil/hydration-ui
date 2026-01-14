import { Flex } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SRecipientAddressBookItem = styled(Flex)(
  ({ theme }) => css`
    align-items: center;
    justify-content: space-between;
    gap: ${theme.scales.paddings.base}px;

    padding-inline: ${theme.scales.paddings.m}px;
    padding-block: ${theme.scales.paddings.m}px;

    cursor: pointer;

    &:hover {
      background: ${theme.controls.dim.accent};
    }
  `,
)
