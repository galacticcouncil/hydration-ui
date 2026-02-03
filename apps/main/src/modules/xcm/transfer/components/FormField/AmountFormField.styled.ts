import { NumberInput } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SNumberInput = styled(NumberInput)(({ theme }) => [
  css`
    text-align: right;
    font-size: ${theme.fontSizes.p2};

    padding-inline: 0;

    transition: ${theme.transitions.colors};
  `,
])

export const SNumberInputAddon = styled.div`
  text-align: right;
  margin-left: auto;
  pointer-events: none;

  ${mq("sm")} {
    position: absolute;
    bottom: ${({ theme }) => theme.space["-base"]};
    right: 0;
    & > p {
      white-space: nowrap;
    }
  }
`
