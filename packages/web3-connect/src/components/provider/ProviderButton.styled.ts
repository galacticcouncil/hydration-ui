import { ButtonTransparent } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SProviderButton = styled(ButtonTransparent)(
  ({ theme }) => css`
    --border-color: ${theme.details.borders};
    --background-color: ${theme.surfaces.containers.dim.dimOnBg};

    &:hover,
    &:active {
      --border-color: ${theme.buttons.secondary.outline.outline};
      --background-color: ${theme.buttons.secondary.outline.fill};
    }

    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    padding-block: ${theme.space.xl};
    padding-inline: ${theme.space.s};

    cursor: pointer;

    transition: ${theme.transitions.colors};

    border-radius: ${theme.radii.m};
    border: 1px solid var(--border-color);
    background: var(--background-color);
  `,
)

export const SConnectionIndicator = styled.div`
  width: 4px;
  height: 4px;
  background: ${({ theme }) => theme.colors.successGreen[400]};

  border-radius: 50%;
  position: absolute;
  top: 8px;
  left: 8px;
`

export const SAccountIndicator = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.text.high};

  border-radius: ${({ theme }) => theme.radii.base};

  position: absolute;
  top: 4px;
  right: 4px;

  padding: 3px 5px;

  opacity: 0.8;

  transition: ${({ theme }) => theme.transitions.colors};

  background: ${({ theme }) => theme.surfaces.containers.dim.dimOnBg};
  border: 1px solid var(--border-color);
`
