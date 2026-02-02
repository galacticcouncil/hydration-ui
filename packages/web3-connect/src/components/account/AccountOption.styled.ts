import { Button, CopyButton } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SAccountOption = styled.div<{
  disabled?: boolean
}>(
  ({ theme, disabled }) => css`
    position: relative;
    width: 100%;
    min-height: 4rem;
    min-width: 0;

    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;

    padding: ${theme.space.s} ${theme.space.l};
    transition: ${theme.transitions.colors};

    background: ${theme.surfaces.containers.dim.dimOnBg};
    border-radius: ${theme.radii.m};
    border: 1px solid ${theme.details.borders};

    ${!disabled &&
    css`
      cursor: pointer;

      &[data-active="true"],
      &[data-active="true"]:hover,
      &[data-active="true"]:focus {
        background-color: ${theme.buttons.secondary.outline.fill};
        border-color: ${theme.buttons.secondary.outline.outline};
      }

      &:hover,
      &:active {
        background-color: ${theme.details.borders};
      }
    `}
  `,
)

export const SCopyButton = styled(CopyButton)(
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

export const SChangeAccountButton = styled(Button)<{ isActive?: boolean }>(
  ({ theme, isActive }) => css`
    width: 100%;
    text-transform: uppercase;
    border: 1px solid ${theme.details.borders};
    border-top: none;
    border-radius: ${theme.radii.m};
    border-top-left-radius: 0;
    border-top-right-radius: 0;

    ${isActive &&
    css`
      background-color: ${theme.buttons.secondary.outline.fill};
      border-color: ${theme.buttons.secondary.outline.outline};
    `}
  `,
)
