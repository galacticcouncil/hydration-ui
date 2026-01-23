import { NumberInput } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SNumberInput = styled(NumberInput)(({ theme }) => [
  css`
    text-align: right;
    font-size: 16px;

    padding-inline: 0;

    transition: ${theme.transitions.colors};
  `,
])

export const SNumberInputAddon = styled.div`
  text-align: right;
  margin-left: auto;
  position: absolute;
  bottom: -10px;
  right: 0;
  white-space: nowrap;
  pointer-events: none;
`
