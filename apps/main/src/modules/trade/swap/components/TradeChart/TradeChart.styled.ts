import { Box, Button, Flex } from "@galacticcouncil/ui/components"
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
  () => css`
    align-items: center;
    justify-content: space-between;
    width: 100%;
    ${containerSize(
      "md",
      css`
        padding-block: 0;
        width: auto;
      `,
    )}
  `,
)

export const SChartValues = styled(Flex)(
  () => css`
    display: none;

    ${containerSize(
      "md",
      css`
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      `,
    )}
  `,
)

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

export const SInvertButton = styled(Button)(
  ({ theme }) => css`
    box-sizing: border-box;
    width: 1.75rem;
    height: 1.75rem;
    min-width: 1.75rem;
    padding: 0;

    ${containerSize(
      "sm",
      css`
        width: auto;
        min-width: unset;
        padding-inline: ${theme.space.base};
        gap: ${theme.space.xs};
      `,
    )}
  `,
)

export const SInvertPair = styled.span(css`
  display: none;

  ${containerSize(
    "sm",
    css`
      display: inline;
    `,
  )}
`)
