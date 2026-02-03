import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { mq } from "@galacticcouncil/ui/theme"

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  padding-bottom: var(--layout-bottom-safe-area);
`

export const SContentContainer = styled.div(
  ({ theme }) => css`
    width: 100%;

    border-bottom: 1px solid;
    border-color: ${theme.details.separators};

    padding-block: ${theme.space.base};
    margin-top: ${theme.space["-m"]};
    margin-bottom: ${theme.space.xl};

    ${mq("lg")} {
      margin-top: ${theme.space["-xxl"]};
      margin-bottom: ${theme.space.xxl};
    }

    display: flex;
    justify-content: center;
  `,
)

export const SContent = styled.div(
  ({ theme }) => css`
    width: 100%;
    padding-inline: var(--layout-gutter);
    max-width: ${theme.sizes.content};
  `,
)
