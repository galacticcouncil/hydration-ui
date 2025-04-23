import { styled } from "@galacticcouncil/ui/utils"

export const SProviderButton = styled.button`
  --border-color: ${({ theme }) => theme.details.borders};
  --background-color: ${({ theme }) => theme.surfaces.containers.dim.dimOnBg};

  &:hover,
  &:active {
    --border-color: ${({ theme }) => theme.buttons.secondary.outline.outline};
    --background-color: ${({ theme }) => theme.buttons.secondary.outline.fill};
  }

  position: relative;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 20px;

  cursor: pointer;

  transition: ${({ theme }) => theme.transitions.colors};

  border-radius: ${({ theme }) => theme.radii.lg}px;
  border: 1px solid var(--border-color);
  background: var(--background-color);
`

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

  border-radius: ${({ theme }) => theme.radii.md}px;

  position: absolute;
  top: 4px;
  right: 4px;

  padding: 3px 5px;

  opacity: 0.8;

  transition: ${({ theme }) => theme.transitions.colors};

  background: ${({ theme }) => theme.surfaces.containers.dim.dimOnBg};
  border: 1px solid var(--border-color);
`
