import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Flex, Text } from "@galacticcouncil/ui/components"

export const SHeaderMenu = styled(Flex)`
  gap: 4px;
  overflow: hidden;
`

export const SHeaderMenuItem = styled(Text)<{
  readonly isHidden?: boolean
}>(
  ({ theme, isHidden }) => css`
    ${isHidden &&
    css`
      visibility: hidden;
    `}

    padding: 8px 10px;

    color: ${theme.text.medium};
    font-size: ${theme.paragraphSize.p5};
    line-height: ${theme.lineHeight.s}px;
    text-decoration: none;

    border-radius: ${theme.radii.md}px;

    white-space: nowrap;

    &.active,
    &:hover {
      color: ${theme.text.high};
    }
  `,
)

export const SHeaderMoreMenuItem = styled(SHeaderMenuItem)(
  ({ theme }) => css`
    position: absolute;
    left: 0;
    top: -4px;

    display: flex;
    align-items: center;
    gap: ${theme.scales.paddings.xs}px;

    &:hover {
      cursor: pointer;
    }

    svg {
      width: 12px;
      height: 12px;
      flex-shrink: 0;
    }
  `,
)
