import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Button } from "@galacticcouncil/ui/components"

export const SButton = styled(Button)<{
  hasSelection: boolean
  disabled: boolean
}>(
  ({ theme, hasSelection, disabled }) => css`
    width: fit-content;
    display: inline-flex;
    padding-inline: ${theme.space.base};
    padding-block: ${theme.space.s};
    height: 2.375rem;

    ${hasSelection &&
    css`
      background: transparent;
      border: 1px solid ${theme.buttons.secondary.low.borderRest};
    `}

    ${disabled &&
    css`
      opacity: 0.5;
      cursor: not-allowed;
    `}
  `,
)
