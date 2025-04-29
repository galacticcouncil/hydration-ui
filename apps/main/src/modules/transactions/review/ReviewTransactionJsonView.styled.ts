import { css, styled } from "@galacticcouncil/ui/utils"

export const JsonViewContainer = styled.div(
  ({ theme }) => css`
    position: relative;

    padding: var(--modal-content-padding);
    margin: var(--modal-content-inset);
    margin-bottom: 0;

    background: ${theme.surfaces.containers.dim.dimOnBg};

    max-height: 240px;
    overflow: auto;
  `,
)
