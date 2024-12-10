import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Text } from "@galacticcouncil/ui/components"

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
