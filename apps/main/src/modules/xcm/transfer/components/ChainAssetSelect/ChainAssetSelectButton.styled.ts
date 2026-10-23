import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Button } from "@galacticcouncil/ui/components"

export const SButton = styled(Button, {
  shouldForwardProp: (prop: string) =>
    prop !== "hasSelection" && prop !== "fullWidth",
})<{
  hasSelection: boolean
  fullWidth: boolean
  disabled: boolean
}>(
  ({ theme, hasSelection, fullWidth, disabled }) => css`
    width: ${fullWidth ? "100%" : "fit-content"};
    display: inline-flex;
    justify-content: ${fullWidth ? "space-between" : "center"};
    padding-inline: ${fullWidth ? theme.space.l : theme.space.base};
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
