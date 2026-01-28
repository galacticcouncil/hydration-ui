import { Flex } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SRecipientAddressBookItem = styled(Flex)(
  ({ theme }) => css`
    align-items: center;
    justify-content: space-between;
    gap: ${theme.space.base};

    padding-inline: ${theme.space.m};
    padding-block: ${theme.space.m};

    cursor: pointer;

    &:hover {
      background: ${theme.controls.dim.accent};
    }
  `,
)
