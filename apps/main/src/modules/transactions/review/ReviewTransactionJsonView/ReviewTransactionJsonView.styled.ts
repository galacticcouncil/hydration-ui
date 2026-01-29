import { css, styled } from "@galacticcouncil/ui/utils"

export const JsonViewContainer = styled.div(
  ({ theme }) => css`
    position: relative;

    display: flex;
    flex-direction: column;
    gap: ${theme.space.m};

    margin-bottom: var(--modal-content-inset);

    background: ${theme.surfaces.containers.high.hover};

    height: 280px;
  `,
)
