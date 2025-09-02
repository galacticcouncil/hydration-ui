import { FormError, NumberInput } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SNumberInput = styled(NumberInput)(({ theme }) => [
  css`
    text-align: right;
    font-size: 16px;

    padding-inline: 0;

    transition: ${theme.transitions.colors};
  `,
])

export const SFormError = styled(FormError)(
  ({ theme }) => css`
    margin-left: auto;
    position: absolute;
    bottom: -10px;
    right: 0;

    animation: ${theme.animations.scaleInRight} 0.15s ease forwards;
  `,
)
