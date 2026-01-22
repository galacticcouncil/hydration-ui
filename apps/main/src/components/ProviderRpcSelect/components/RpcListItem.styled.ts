import isPropValid from "@emotion/is-prop-valid"
import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Box } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"

export const SRpcListItem = styled(Box, {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== "isInteractive",
})<{ isInteractive?: boolean }>(
  ({ theme, isInteractive }) => css`
    display: grid;
    grid-template-columns: 3fr 2fr 1fr;
    gap: 10px;

    align-items: center;
    padding: 10px var(--modal-content-padding);
    height: 56px;

    &[data-edit="true"] {
      grid-template-columns: 1fr;
      background: ${theme.surfaces.containers.dim.dimOnBg};
    }

    &[data-loading="true"] {
      opacity: 0.5;
      pointer-events: none;
    }

    ${isInteractive &&
    css`
      border-top: 1px solid ${theme.details.separators};
      cursor: ${isInteractive ? "pointer" : "default"};
      &:hover,
      &:active {
        transition: ${theme.transitions.colors};
        background: ${theme.surfaces.containers.dim.dimOnBg};
      }
    `}

    ${mq("sm")} {
      grid-template-columns: 3fr 2fr 5fr;
    }

    & > * {
      min-width: 0;
    }

    p {
      line-height: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `,
)

export const SRpcRadio = styled.div(
  ({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;

    flex-shrink: 0;

    width: 14px;
    height: 14px;

    border-radius: ${theme.radii.full}px;
    background: ${theme.controls.dim.base};
    border: 1px solid ${theme.controls.outline.base};

    transition: ${theme.transitions.colors};
    flex-shrink: 0;
  `,
)

export const SRpcRadioThumb = styled.div(
  ({ theme }) => css`
    width: 10px;
    height: 10px;

    background: ${theme.controls.solid.active};
    border-radius: ${theme.radii.full}px;

    animation: ${theme.animations.scaleInCenter} 0.2s;
  `,
)
