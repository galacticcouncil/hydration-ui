import { Box, Flex, Stack } from "@galacticcouncil/ui/components"
import { containerSize, css, styled } from "@galacticcouncil/ui/utils"

export const SDetailsContainer = styled(Stack)(
  ({ theme }) => css`
    flex-direction: column;
    gap: ${theme.space.m};
    margin-bottom: ${theme.space.l};

    ${containerSize(
      "md",
      css`
        flex-direction: row;
        gap: ${theme.space.xxxl};
      `,
    )}
  `,
)

export const SDetailsSeparator = styled(Box)(
  ({ theme }) => css`
    flex-shrink: 0;
    align-self: stretch;
    height: 1px;
    background: ${theme.details.separators};

    ${containerSize(
      "md",
      css`
        width: 1px;
        height: auto;
      `,
    )}
  `,
)

export const SStatsGroup = styled(Flex)(
  ({ theme }) => css`
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    gap: ${theme.space.s};
    width: 100%;
    min-width: 0;

    ${containerSize(
      "md",
      css`
        gap: ${theme.space.xxxl};
        display: contents;
      `,
    )}
  `,
)

export const SRemaining = styled(Box)`
  min-width: 0;
  width: 100%;
  ${containerSize(
    "md",
    css`
      width: auto;
    `,
  )}
`

export const SRemainingList = styled(Stack)`
  width: 100%;
  ${containerSize(
    "md",
    css`
      width: auto;
      flex-direction: row;
    `,
  )}
`
