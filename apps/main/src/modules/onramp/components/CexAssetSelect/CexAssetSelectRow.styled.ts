import { ButtonTransparent } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SRow = styled(ButtonTransparent)(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: flex-start;

    width: 100%;
    height: 100%;

    padding-inline: ${theme.scales.paddings.m}px;
    gap: ${theme.scales.paddings.m}px;

    &:hover {
      background: ${theme.details.separators};
    }
  `,
)
