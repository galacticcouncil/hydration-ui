import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { mq } from "@galacticcouncil/ui/theme"

import { TOP_NAVBAR_BREAKPOINT } from "@/modules/layout/constants"

export const SHeader = styled.header(
  ({ theme }) => css`
    position: sticky;
    top: 0;
    z-index: ${theme.zIndices.header};

    display: grid;
    grid-template-columns: 1fr auto;

    align-items: center;
    gap: ${theme.space.xxxl};

    height: 3.375rem;

    width: 100%;
    padding: 0 var(--layout-gutter);
    margin-bottom: ${theme.space.m};
    border-bottom: 1px solid;
    border-color: ${theme.details.separators};
    background: ${theme.surfaces.themeBasePalette.background};

    ${mq(TOP_NAVBAR_BREAKPOINT)} {
      grid-template-columns: auto 1fr auto;
      padding-left: var(--layout-gutter);
      padding-right: ${theme.space.m};
      margin-bottom: ${theme.space.xxl};
    }
  `,
)
