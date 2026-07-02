import { Button, Text } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SConnectedButton = styled(Button)(
  ({ theme }) => css`
    background: ${theme.buttons.outlineDark.rest};
    gap: ${theme.space.s};
    padding: ${theme.space.base};

    &:not(:disabled):hover,
    &:not(:disabled):active {
      background: ${theme.buttons.outlineDark.hover};
    }
  `,
)

export const SHoverText = styled(Text)(
  ({ theme }) => css`
    position: relative;
    & > span {
      transition: ${theme.transitions.opacity};
    }
    & > span:nth-of-type(1) {
      opacity: 1;
    }
    & > span:nth-of-type(2) {
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0;
    }

    &:hover,
    [data-web3-connect-connected-button="true"]:hover & {
      & > span:nth-of-type(1) {
        opacity: 0;
      }
      & > span:nth-of-type(2) {
        opacity: 1;
      }
    }
  `,
)

export const SAddressHoverText = styled(SHoverText)(
  () => css`
    max-width: 220px;

    & > span {
      display: block;
      max-width: inherit;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,
)
