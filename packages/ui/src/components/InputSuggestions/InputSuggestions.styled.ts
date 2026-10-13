import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { SContent as SPopoverContent } from "@/components/Popover"
import { pressScale, pressScaleTransition } from "@/styles/press"

export const SContent = styled(SPopoverContent)(
  ({ theme }) => css`
    inline-size: var(--radix-popover-trigger-width);
    padding: ${theme.space.s};
    box-sizing: border-box;
    background: ${theme.surfaces.containers.high.hover};
    border: 1px solid ${theme.details.borders};
    border-radius: calc(${theme.radii.m} + ${theme.space.s});
    overflow: clip;
    box-shadow: 0 10px 15px oklch(0 0 none / 25%);
  `,
)

export const SOption = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.space.m};
    padding-block: ${theme.space.base};
    padding-inline: ${theme.space.l};
    color: ${theme.text.high};
    border-radius: ${theme.radii.m};
    cursor: pointer;

    transition: ${pressScaleTransition};

    ${pressScale};

    &[aria-selected="true"] {
      background: ${theme.buttons.outlineDark.hover};
    }
  `,
)
