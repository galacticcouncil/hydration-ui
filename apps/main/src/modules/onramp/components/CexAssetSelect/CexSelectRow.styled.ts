import { Button } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SButton = styled(Button)<{ isActive: boolean }>(
  ({ theme, isActive }) => css`
    width: 100%;
    justify-content: flex-start;
    color: ${isActive ? theme.text.high : theme.text.medium};
    padding-inline: ${theme.scales.paddings.base}px;
  `,
)
