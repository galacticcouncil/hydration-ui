import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { mq } from "@galacticcouncil/ui/theme"

export const SContainer = styled.div(
  ({ theme }) => css`
    --layout-gutter: ${theme.scales.paddings.m}px;
    --layout-bottom-safe-area: 10px;

    ${mq("lg")} {
      --layout-gutter: 30px;
      --layout-bottom-safe-area: 40px;
    }

    display: flex;
    flex-direction: column;
    align-items: center;

    padding-bottom: var(--layout-bottom-safe-area);
  `,
)

export const SContentContainer = styled.div(
  ({ theme }) => css`
    width: 100%;

    border-bottom: 1px solid;
    border-color: ${theme.details.separators};

    padding-block: 8px;
    margin-bottom: ${theme.scales.paddings.xxl}px;

    display: flex;
    justify-content: center;
  `,
)

export const SContent = styled.div`
  width: 100%;
  padding-inline: var(--layout-gutter);

  ${mq("lg")} {
    max-width: 1360px;
  }
`
