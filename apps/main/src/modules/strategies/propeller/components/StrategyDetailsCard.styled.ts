import { Box } from "@galacticcouncil/ui/components"
import { containerSize, css, styled } from "@galacticcouncil/ui/utils"

export const SDetailsContainer = styled(Box)(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: 1fr;
    align-items: start;
    padding: ${theme.space.l};
    gap: 0;

    ${containerSize(
      "sm",
      css`
        grid-template-columns: repeat(2, minmax(0, 1fr));
      `,
    )}

    ${containerSize(
      "md",
      css`
        display: flex;
        flex-direction: row;
        align-items: stretch;
      `,
    )}
  `,
)

export const SStatItem = styled(Box)(
  ({ theme }) => css`
    min-width: 0;

    &:not(:last-child) {
      padding-bottom: ${theme.space.xxl};
      margin-bottom: ${theme.space.xxl};
      border-bottom: 1px solid ${theme.details.separators};
    }

    ${containerSize(
      "sm",
      css`
        margin: 0;
        padding: ${theme.space.xxl};
        border: 0 solid ${theme.details.separators};

        &:not(:last-child) {
          margin-bottom: 0;
          padding-bottom: ${theme.space.xxl};
          border-bottom-width: 0;
        }

        &:nth-child(odd) {
          border-right-width: 1px;
          padding-left: 0;
        }

        &:nth-child(even) {
          padding-right: 0;
        }

        &:nth-child(-n + 2) {
          border-bottom-width: 1px;
          padding-top: 0;
        }

        &:nth-child(n + 3) {
          padding-bottom: 0;
        }
      `,
    )}

    ${containerSize(
      "md",
      css`
        flex: 1 1 0;
        margin: 0;
        padding: 0 ${theme.space.xxl};
        border-style: solid;
        border-color: ${theme.details.separators};
        border-width: 0 1px 0 0;

        &:not(:last-child),
        &:nth-child(odd),
        &:nth-child(even),
        &:nth-child(-n + 2),
        &:nth-child(n + 3) {
          margin: 0;
          padding: 0 ${theme.space.xxl};
          border-width: 0 1px 0 0;
        }

        &:first-child {
          padding-left: 0;
        }

        &:last-child {
          padding-right: 0;
          border-width: 0;
        }
      `,
    )}
  `,
)
