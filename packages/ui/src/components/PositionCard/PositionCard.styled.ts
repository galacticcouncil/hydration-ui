import { containerSize, css, styled } from "@galacticcouncil/ui/utils"

import { Box } from "@/components/Box"
import { Flex } from "@/components/Flex"

export const SRowContainer = styled(Flex)(
  ({ theme }) => css`
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.space.l};

    /* On one row, equal side columns put the stats at the same place on every
       card, centred between the name and the actions, whatever their widths.
       A side wider than its share still grows to fit its content. */
    ${containerSize(
      "md",
      css`
        display: grid;
        grid-template-columns:
          minmax(max-content, 1fr)
          minmax(0, 2fr)
          minmax(max-content, 1fr);
        gap: ${theme.space.xxl};
      `,
    )}
  `,
)

export const SNameColumn = styled(Flex)`
  order: 0;
  flex-shrink: 0;
  min-width: 120px;
`

const valuesTemplate = (columns?: number | string) => {
  if (typeof columns === "number") {
    return css`
      grid-template-columns: repeat(${columns}, minmax(0, 1fr));
    `
  }

  if (columns) {
    return css`
      grid-template-columns: ${columns};
    `
  }

  return css`
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
  `
}

export const SValuesColumn = styled(Box, {
  shouldForwardProp: (prop) => prop !== "columns",
})<{ columns?: number | string }>`
  display: grid;
  order: 2;
  flex: 1 1 100%;
  flex-basis: 100%;
  min-width: 0;
  align-items: center;
  gap: ${({ theme }) => theme.space.xxl};

  ${({ columns }) => valuesTemplate(columns)}

  & > * {
    min-width: 0;
  }

  ${containerSize(
    "md",
    css`
      order: 1;
      flex: 1 1 auto;
      flex-basis: auto;
    `,
  )}
`

export const SActionColumn = styled(Flex)`
  order: 1;
  flex-shrink: 0;
  min-width: 0;

  ${containerSize(
    "md",
    css`
      order: 2;
      min-width: 11rem;
    `,
  )}
`
