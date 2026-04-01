import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { pxToRem } from "@galacticcouncil/ui/utils"

import { Box } from "@/components/Box"
import { Flex } from "@/components/Flex"
import { mq } from "@/theme"

export const SPromoteBannerContent = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== "backgroundImage" && prop !== "backgroundImageMobile",
})<{ backgroundImage: string; backgroundImageMobile: string }>(
  ({ theme, backgroundImage, backgroundImageMobile }) => css`
    width: 100%;
    outline: none;
    pointer-events: auto;
    position: relative;
    overflow: visible;

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
