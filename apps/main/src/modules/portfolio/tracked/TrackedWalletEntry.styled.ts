import { CopyButton } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

const actionButtonCss = css`
  display: inline-flex;
  cursor: pointer;
`

export const STrackedWalletCopyButton = styled(CopyButton)(
  ({ theme }) => css`
    ${actionButtonCss}
    color: ${theme.text.medium};

    &[data-copied="true"] {
      color: ${theme.accents.success.emphasis};
    }

    &:hover:not(:disabled) {
      color: ${theme.text.high};
    }
  `,
)

export const STrackedWalletRemoveButton = styled.button(
  ({ theme }) => css`
    ${actionButtonCss}
    padding: 0;
    border: 0;
    background: transparent;
    color: ${theme.text.medium};

    &:hover:not(:disabled) {
      color: ${theme.text.high};
    }
  `,
)
