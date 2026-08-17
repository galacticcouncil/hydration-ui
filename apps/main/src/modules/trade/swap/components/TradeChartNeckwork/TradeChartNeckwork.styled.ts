import { Box, Flex } from "@galacticcouncil/ui/components"
import { containerSize, css, styled } from "@galacticcouncil/ui/utils"

export const SChartHeader = styled(Flex)(
  ({ theme }) => css`
    flex-direction: column;
    gap: ${theme.space.s};

    ${containerSize(
      "md",
      css`
        gap: ${theme.space.base};
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
      `,
    )}
  `,
)

export const SChartPriceRow = styled(Flex)(css`
  align-items: center;
  justify-content: space-between;
  width: 100%;

  ${containerSize(
    "md",
    css`
      justify-content: flex-start;
    `,
  )}
`)

export const SChartControls = styled(Flex)(
  ({ theme }) => css`
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding-block: ${theme.space.s};
    ${containerSize(
      "md",
      css`
        padding-block: 0;
        width: auto;
      `,
    )}
  `,
)

export const SChartOhlc = styled(Box)(css`
  display: none;

  ${containerSize(
    "md",
    css`
      display: block;
    `,
  )}
`)

export const SChartIntervals = styled(Box)(css`
  display: none;

  ${containerSize(
    "sm",
    css`
      display: block;
    `,
  )}
`)

export const SChartIntervalsCompact = styled(Box)(css`
  display: block;

  ${containerSize(
    "sm",
    css`
      display: none;
    `,
  )}
`)
