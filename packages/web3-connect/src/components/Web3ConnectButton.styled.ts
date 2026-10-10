import { Button, Text } from "@galacticcouncil/ui/components"
import { css, pxToRem, styled } from "@galacticcouncil/ui/utils"

export const SConnectedButton = styled(Button)(
  ({ theme }) => css`
    --button-bg: ${theme.buttons.outlineDark.rest};
    --button-icon: ${pxToRem(8)};
    gap: ${theme.space.s};
    padding: ${theme.space.base};

    &:not(:disabled):hover,
    &:not(:disabled):active {
      --button-bg: ${theme.buttons.outlineDark.hover};
    }
  `,
)

export const SHoverText = styled(Text)(
  ({ theme }) => css`
    position: relative;
    & > span {
      transition: ${theme.transitions.opacity};
    }
    & > span:nth-child(1) {
      opacity: 1;
    }
    & > span:nth-child(2) {
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0;
    }

    &:hover {
      & > span:nth-child(1) {
        opacity: 0;
      }
      & > span:nth-child(2) {
        opacity: 1;
      }
    }
  `,
)
