import { Theme } from "@emotion/react"
import { CopyButton } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

const accountActionButtonCss = (theme: Theme) => css`
  display: inline-flex;
  color: ${theme.text.medium};
  cursor: pointer;

  &[data-copied="true"] {
    color: ${theme.accents.success.emphasis};
  }

  &:hover:not(:disabled) {
    color: ${theme.text.high};
  }
`

export const SAccountActionCopyButton = styled(CopyButton)(({ theme }) =>
  accountActionButtonCss(theme),
)

export const SAccountActionButton = styled.button(({ theme }) =>
  accountActionButtonCss(theme),
)
