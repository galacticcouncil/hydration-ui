import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { SContainerVertical } from "sections/stats/StatsPage.styled"
import { theme } from "theme"

export const SContainer = styled(SContainerVertical)`
  gap: 20px;
  padding: 20px;
  @media (${theme.viewport.gte.sm}) {
    padding: 40px;
  }
`

export const SStatsContainer = styled.div<{ columns: number }>(
  ({ columns = 3 }) => css`
    --box-padding: 20px;

    @media (${theme.viewport.gte.sm}) {
      --box-padding: 40px;
    }

    display: grid;
    grid-template-columns: repeat(${columns}, 1fr);
    margin: calc(var(--box-padding) * -1) 0;
    padding-top: 20px;

    & > div {
      padding: var(--box-padding) 15%;
      position: relative;

      border-top: 1px solid rgba(${theme.rgbColors.white}, 0.06);

      &:after {
        content: "";
        position: absolute;
        top: 15%;

        right: 0;
        width: 1px;
        height: 70%;
        border-right: 1px solid rgba(${theme.rgbColors.white}, 0.06);
      }

      &:nth-of-type(${columns}n):after {
        border-right: none;
      }

      &:nth-of-type(-n + ${columns}) {
        border-top: none;
      }

      &:nth-of-type(${columns}n + 1) {
        padding-left: 0;
      }
    }
  `,
)
