import { Flex } from "@galacticcouncil/ui/components"
import { containerSize, css, styled } from "@galacticcouncil/ui/utils"

export const SRowContainer = styled(Flex)`
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;

  ${containerSize(
    "md",
    css`
      flex-wrap: nowrap;
    `,
  )}
`

export const SNameColumn = styled(Flex)`
  order: 0;
  min-width: 120px;
`

export const SValuesColumn = styled(Flex)`
  order: 2;
  flex: 1 1 100%;
  flex-basis: 100%;
  min-width: 0;
  justify-content: space-between;

  ${containerSize(
    "md",
    css`
      order: 1;
      flex: 1 1 auto;
      flex-basis: auto;
      justify-content: space-around;
    `,
  )}
`

export const SActionColumn = styled(Flex)`
  order: 1;
  min-width: 140px;

  ${containerSize(
    "md",
    css`
      order: 2;
    `,
  )}
`
