import { CopyButton, Flex } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SAddressBookEntry = styled(Flex)<{
  disabled?: boolean
}>(
  ({ theme, disabled }) => css`
    align-items: center;
    justify-content: space-between;
    gap: ${theme.space.base};

    padding-inline: ${theme.space.m};
    padding-block: ${theme.space.m};

    ${!disabled &&
    css`
      cursor: pointer;

      &:hover {
        background: ${theme.controls.dim.accent};
      }
    `}
  `,
)

export const SAddressBookEntryCopyButton = styled(CopyButton)(
  ({ theme }) => css`
    color: ${theme.text.medium};
    cursor: pointer;

    &[data-copied="true"] {
      color: ${theme.accents.success.emphasis};
    }

    &:hover:not(:disabled) {
      color: ${theme.text.high};
    }
  `,
)
