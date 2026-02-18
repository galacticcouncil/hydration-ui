import { css, styled } from "@galacticcouncil/ui/utils"

export const TabMenuBadge = styled.div(
  ({ theme }) => css`
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(25%, -25%);

    display: inline-flex;
    align-items: center;
    justify-content: center;

    background: ${theme.buttons.primary.high.rest};
    color: ${theme.buttons.primary.high.onButton};
    border-radius: ${theme.radii.full};

    padding-inline: ${theme.space.s};

    height: ${theme.space.l};
    min-width: ${theme.space.l};

    font-size: 0.5rem;
    font-weight: 700;
    line-height: 1;

    border: 1px solid ${theme.details.borders};
  `,
)
