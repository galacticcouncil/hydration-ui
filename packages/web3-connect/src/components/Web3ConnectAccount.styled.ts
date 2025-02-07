import { css, styled } from "@galacticcouncil/ui/utils"

export const SAccountItem = styled.button<{
  withButton?: boolean
}>`
  position: relative;
  width: 100%;
  min-height: 65px;

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
