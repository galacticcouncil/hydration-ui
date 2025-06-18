import { CopyButton } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SAccountOption = styled.div<{
  withButton?: boolean
}>`
  position: relative;
  width: 100%;
  min-height: 65px;
  min-width: 0;

  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;

  cursor: pointer;

  padding: 4px 16px;
  transition: ${({ theme }) => theme.transitions.colors};

  background: ${({ theme }) => theme.surfaces.containers.dim.dimOnBg};
  border-radius: ${({ theme }) => theme.radii.lg}px;
  border: 1px solid ${({ theme }) => theme.details.borders};

  &[data-active="true"],
  &[data-active="true"]:hover,
  &[data-active="true"]:focus {
    background-color: ${({ theme }) => theme.buttons.secondary.outline.fill};
    border-color: ${({ theme }) => theme.buttons.secondary.outline.outline};
  }

  &:hover,
  &:active {
    background-color: ${({ theme }) => theme.details.borders};
  }

  ${({ withButton }) =>
    withButton &&
    css`
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    `}
`

export const SChangeAccountButton = styled.button`
  border: ${({ theme }) => theme.details.borders};
  border-top-color: transparent;

  border-radius: ${({ theme }) => theme.radii.lg}px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
`

export const SCopyButton = styled(CopyButton)(
  ({ theme }) => css`
    color: ${theme.text.medium};
    &[data-copied="true"] {
      color: ${theme.accents.success.emphasis};
    }
    &:hover:not(:disabled) {
      color: ${theme.text.high};
    }
  `,
)
