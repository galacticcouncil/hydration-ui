import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Box, Text } from "@galacticcouncil/ui/components"

export const SHeaderMenuItem = styled(Text)(
  ({ theme }) => css`
    padding: 8px 10px;
    color: ${theme.text.medium};
    font-size: ${theme.paragraphSize.p5};
    line-height: ${theme.lineHeight.s}px;
    text-decoration: none;

    border-radius: ${theme.radii.md}px;

    &.active,
    &:hover {
      color: ${theme.text.high};
    }
  `,
)

export const SHeaderSubmenuItem = styled(Box)(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    gap: 10px;

    padding: 16px;
    border-radius: ${theme.radii.xl}px;

    text-decoration: none;

    &:hover {
      background: ${theme.surfaces.containers.high.hover};
    }
  `,
)
