import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Flex, Text } from "@galacticcouncil/ui/components"

export const SHeaderMenu = styled(Flex)`
  gap: 2px;
  overflow: hidden;
`

export const SHeaderMenuItem = styled(Text, {
  shouldForwardProp: (prop) => prop !== "isHidden",
})<{
  readonly isHidden?: boolean
}>(
  ({ theme, isHidden }) => css`
    ${isHidden &&
    css`
      visibility: hidden;
    `}

    height: 31px;
    padding: ${theme.buttons.paddings.tertiary}px 10px;

    font-family: ${theme.fontFamilies1.secondary};
    font-size: ${theme.paragraphSize.p5};
    line-height: ${theme.lineHeight.s}px;
    color: ${theme.text.medium};
    text-decoration: none;

    white-space: nowrap;

    &[data-status="active"],
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
