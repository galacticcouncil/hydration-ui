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

export const SConnectionIndicator = styled.div(
  ({ theme }) => css`
    width: ${theme.sizes["3xs"]};
    height: ${theme.sizes["3xs"]};
    background: ${theme.colors.successGreen[400]};

    border-radius: 50%;
    position: absolute;
    top: ${theme.space.base};
    left: ${theme.space.base};
  `,
)

export const SAccountIndicator = styled.div(
  ({ theme }) => css`
    font-size: ${theme.fontSizes.p6};
    color: ${theme.text.high};

    border-radius: ${theme.radii.base};

    position: absolute;
    top: ${theme.space.xs};
    right: ${theme.space.xs};

    padding: ${theme.space.xs} ${theme.space.s};

    opacity: 0.8;

    transition: ${theme.transitions.colors};

    background: ${theme.surfaces.containers.dim.dimOnBg};
    border: 1px solid var(--border-color);
  `,
)
