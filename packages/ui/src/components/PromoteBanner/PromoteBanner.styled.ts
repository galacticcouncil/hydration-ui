import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { pxToRem } from "@galacticcouncil/ui/utils"

import { Box } from "@/components/Box"
import { Flex } from "@/components/Flex"
import { mq } from "@/theme"

export const SPromoteBannerContent = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== "backgroundImage" &&
    prop !== "backgroundImageMobile" &&
    prop !== "$exiting",
})<{
  backgroundImage: string
  backgroundImageMobile: string
  $exiting?: boolean
}>(
  ({ theme, backgroundImage, backgroundImageMobile, $exiting }) => css`
    width: 100%;
    outline: none;
    pointer-events: ${$exiting ? "none" : "auto"};
    position: relative;
    overflow: visible;

    &::after {
      content: "";
      position: absolute;
      inset: -25%;
      z-index: 20;
      pointer-events: none;
      border-radius: 50%;
      background: radial-gradient(
        circle,
        rgba(255, 255, 255, 0.31) 0%,
        transparent 45%
      );
      mix-blend-mode: overlay;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover::after {
      opacity: 1;
    }

    transition:
      transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.22s ease;
    transform: ${$exiting
      ? `translateX(${pxToRem(-40)}) rotate(-3deg)`
      : "none"};
    opacity: ${$exiting ? 0 : 1};

    box-shadow:
      0 0 15px rgba(177, 167, 234, 0.08),
      inset 0 0 30px rgba(177, 167, 234, 0.03),
      inset 0 0 0 1px rgba(255, 255, 255, 0.101);

    border-radius: ${theme.radii.xl};
    border: 1px solid ${theme.details.separators};
    background-image: url(${backgroundImageMobile});
    background-size: cover;
    background-position: right;
    background-repeat: no-repeat;
    box-shadow: ${theme.shadows.base};

    ${mq("sm")} {
      width: ${pxToRem(278)};
      background-image: url(${backgroundImage});
      background-position: center;
    }
  `,
)

export const SPromoteBannerBody = styled(Flex)(
  ({ theme }) => css`
    justify-content: flex-end;
    padding: ${theme.space.xl} ${theme.space.l} ${theme.space.l};
    text-align: center;

    ${mq("sm")} {
      min-height: 21.5rem;
    }
  `,
)

export const SPromoteBannerClose = styled("button")(
  ({ theme }) => css`
    position: absolute;
    top: ${pxToRem(-4)};
    right: ${pxToRem(-6)};
    width: 1.5rem;
    height: 1.5rem;
    border-radius: ${theme.radii.full};
    border: 1px solid ${theme.details.separatorsOnDim};
    background: ${theme.icons.onContainer};
    color: ${theme.colors.darkBlue[900]};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
      background: ${theme.icons.onSurfaceHover};
    }
  `,
)
