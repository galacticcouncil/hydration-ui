import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Content, Trigger } from "@radix-ui/react-tooltip"

import { createVariants } from "@/utils"

export type TooltipSize = "small" | "medium" | "large"

export const STrigger = styled(Trigger)`
  all: unset;

  height: fit-content;
`

const sizeVariants = createVariants<TooltipSize>((theme) => ({
  small: css`
    font-size: ${theme.fontSizes.p6};
    line-height: ${theme.lineHeights.s};
    padding: ${theme.space.s} ${theme.space.base};
    border-radius: ${theme.radii.base};
    box-shadow: 2px 2px 2px 0px rgba(41, 41, 60, 0.15);
  `,
  medium: css`
    font-size: ${theme.fontSizes.p5};
    line-height: ${theme.lineHeights.m};
    padding: ${theme.space.m} ${theme.space.l};
    border-radius: ${theme.radii.m};
    box-shadow: 4px 8px 20px 0px rgba(41, 41, 60, 0.3);
  `,
  large: css`
    font-size: ${theme.fontSizes.p4};
    line-height: ${theme.lineHeights.l};
    padding: ${theme.space.l} ${theme.space.xl};
    border-radius: ${theme.radii.m};
    box-shadow: 4px 8px 30px 0px rgba(41, 41, 60, 0.4);
  `,
}))

export const SContent = styled(Content, {
  shouldForwardProp: (prop) => prop !== "size",
})<{ size?: TooltipSize }>(({ theme, size = "medium" }) => [
  css`
    z-index: ${theme.zIndices.tooltip};

    max-width: ${theme.sizes["4xl"]};

    background: ${theme.details.tooltips};

    animation-duration: 150ms;
    animation-timing-function: ${theme.easings.outExpo};

    &[data-state$="open"] {
      &[data-side="top"] {
        animation-name: ${theme.animations.scaleInTop};
      }

      &[data-side="bottom"] {
        animation-name: ${theme.animations.scaleInBottom};
      }

      &[data-side="left"] {
        animation-name: ${theme.animations.scaleInLeft};
      }

      &[data-side="right"] {
        animation-name: ${theme.animations.scaleInRight};
      }
    }

    &[data-state="closed"] {
      &[data-side="top"] {
        animation-name: ${theme.animations.scaleOutTop};
      }

      &[data-side="bottom"] {
        animation-name: ${theme.animations.scaleOutBottom};
      }

      &[data-side="left"] {
        animation-name: ${theme.animations.scaleOutLeft};
      }

      &[data-side="right"] {
        animation-name: ${theme.animations.scaleOutRight};
      }
    }
  `,
  sizeVariants(size),
])

export const tooltipTextFontSize: Record<TooltipSize, "p4" | "p5" | "p6"> = {
  small: "p6",
  medium: "p5",
  large: "p4",
}
