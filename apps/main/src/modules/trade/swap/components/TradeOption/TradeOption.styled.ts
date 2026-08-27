import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const STradeOptionSkeleton = styled.div(
  ({ theme }) => css`
    display: grid;

    border: 1px solid ${theme.buttons.outlineDark.onOutline};
    border-radius: ${theme.radii.m};
    padding: ${theme.space.l} ${theme.space.m};

    width: 100%;
    height: 4rem;
  `,
)
