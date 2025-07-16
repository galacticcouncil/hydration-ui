import { Box } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const ExpandableContainer = styled(Box)`
  overflow: hidden;
  padding-left: 14px;
`

export const ExpandButton = styled.button(
  ({ theme }) => css`
    position: absolute;

    font-size: 12px;
    cursor: pointer;
    text-align: center;
    color: ${theme.buttons.primary.medium.rest};
    text-decoration: underline;

    bottom: 0;
    left: 0;
    right: 0;

    padding-top: 50px;

    background-image: linear-gradient(
      180deg,
      transparent 0%,
      ${theme.surfaces.containers.high.hover} 100%
    );

    :hover {
      text-decoration: none;
    }
  `,
)
