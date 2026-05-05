import { Box } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const ExpandableContainer = styled(Box)`
  overflow: hidden;
  padding-left: ${({ theme }) => theme.space.tertiary};
`

export const ExpandButton = styled.button(
  ({ theme }) => css`
    position: absolute;

    font-size: ${theme.fontSizes.p6};
    font-weight: 600;
    cursor: pointer;
    text-align: center;
    color: ${theme.buttons.primary.medium.rest};
    text-decoration: underline;
    box-sizing: content-box;

    width: 100%;
    height: 2rem;

    padding-top: 2rem;

    bottom: 0;
    left: 0;
    right: 0;

    background-image: linear-gradient(
      180deg,
      transparent 0%,
      ${theme.surfaces.containers.high.hover} 70%
    );

    :hover {
      text-decoration: none;
    }
  `,
)
