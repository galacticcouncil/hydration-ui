import { Flex } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"
import { css, pxToRem, styled } from "@galacticcouncil/ui/utils"

export const SFixedActionsBar = styled(Flex)(
  ({ theme }) => css`
    position: fixed;
    inset: auto 0 0;
    z-index: 3;
    height: ${pxToRem(60)};
    padding: ${theme.space.base} ${theme.space.m};
    backdrop-filter: blur(6px);
    border-top: 1px solid ${theme.details.borders};
    background: linear-gradient(
      0deg,
      ${theme.surfaces.themeBasePalette.background} 2.59%,
      transparent 89.06%
    );

    ${mq("md")} {
      position: static;
      height: auto;
      padding: 0;
      backdrop-filter: none;
      background: transparent;
    }
  `,
)
