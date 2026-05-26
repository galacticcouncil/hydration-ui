import { Box, Flex, Stack } from "@galacticcouncil/ui/components"
import { containerSize, css, pxToRem, styled } from "@galacticcouncil/ui/utils"

export const SDetailsContainer = styled(Stack)(
  ({ theme }) => css`
    flex-direction: column;
    gap: ${theme.space.m};
    margin-bottom: ${theme.space.l};

    ${containerSize(
      "sm",
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
      "sm",
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
    gap: ${theme.space.xxxl};
    width: 100%;
    min-width: 0;

    ${containerSize(
      "sm",
      css`
        display: contents;
      `,
    )}
  `,
)

export const SRemaining = styled(Box)`
  min-width: 0;
  width: 100%;
  ${containerSize(
    "sm",
    css`
      width: auto;
    `,
  )}
`

export const SRemainingList = styled(Stack)`
  width: 100%;
  ${containerSize(
    "sm",
    css`
      width: auto;
      flex-direction: row;
    `,
  )}
`

export const SRemainingItem = styled(Stack)`
  width: 100%;
  ${containerSize(
    "sm",
    css`
      width: ${pxToRem(120)};
    `,
  )}
  ${containerSize(
    "md",
    css`
      width: ${pxToRem(160)};
    `,
  )}
`
