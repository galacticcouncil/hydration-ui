import { css } from "@emotion/react"
import styled from "@emotion/styled"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { createVariants } from "@/utils"

export type PopoverAnimation =
  | "slide-bottom"
  | "slide-top"
  | "scale-bottom"
  | "scale-top"

export const PopoverTrigger = styled(PopoverPrimitive.Trigger)`
  cursor: pointer;
`

const animationVariants = createVariants<PopoverAnimation>((theme) => ({
  "slide-bottom": css`
    &[data-state="open"] {
      animation-name: ${theme.animations.slideInBottom};
    }
    &[data-state="closed"] {
      animation-name: ${theme.animations.slideOutBottom};
    }
  `,
  "slide-top": css`
    &[data-state="open"] {
      animation-name: ${theme.animations.slideInTop};
    }
    &[data-state="closed"] {
      animation-name: ${theme.animations.slideOutTop};
    }
  `,
  "scale-bottom": css`
    &[data-state="open"] {
      animation-name: ${theme.animations.scaleInBottom};
    }
    &[data-state="closed"] {
      animation-name: ${theme.animations.scaleOutBottom};
    }
  `,
  "scale-top": css`
    &[data-state="open"] {
      animation-name: ${theme.animations.scaleInTop};
    }
    &[data-state="closed"] {
      animation-name: ${theme.animations.scaleOutTop};
    }
  `,
}))

export const SPopoverContent = styled(PopoverPrimitive.Content, {
  shouldForwardProp: (prop) => !["animation"].includes(prop),
})<{
  animation?: PopoverAnimation
}>(({ theme, animation = "scale-top" }) => [
  css`
    --popover-content-horizontal-padding: ${theme.space.base};

    display: flex;
    flex-direction: column;
    justify-content: stretch;

    padding: ${theme.buttons.paddings.tertiary}
      var(--popover-content-horizontal-padding);
    background-color: ${theme.surfaces.containers.high.primary};
    border: 1px solid ${theme.details.borders};
    border-radius: ${theme.radii.xl};

    box-shadow: 0px 38px 187px 0px #00000066;
    box-shadow: 0px 3px 9px 0px #0000001a;

    z-index: ${theme.zIndices.popover};

    animation-duration: 250ms;
    animation-timing-function: ${theme.easings.outExpo};
  `,
  animationVariants(animation),
])
