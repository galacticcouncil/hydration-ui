import { css, styled } from "@galacticcouncil/ui/utils"

export const JsonViewContainer = styled.div(
  ({ theme }) => css`
    position: relative;

    display: flex;
    flex-direction: column;
    gap: 14px;

    padding: var(--modal-content-padding);
    margin: var(--modal-content-inset);
    margin-bottom: 0;

    background: ${theme.surfaces.containers.high.hover};

    max-height: 320px;
    overflow: auto;

    & > *:not(:first-of-type) {
      border-top: 1px solid ${theme.details.borders};
      padding-top: 14px;
    }
  `,
)
