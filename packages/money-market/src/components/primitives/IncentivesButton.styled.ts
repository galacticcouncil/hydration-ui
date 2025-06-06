import styled from "@emotion/styled"
import { css } from "@galacticcouncil/ui/utils"

export const SContainer = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px 4px;

    font-size: 12px;
    line-height: 1;

    border: 1px solid ${theme.details.borders};
    border-radius: ${theme.radii.md}px;
    background-color: ${theme.surfaces.containers.high.primary};

    cursor: pointer;
  `,
)
