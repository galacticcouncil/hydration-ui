import { Flex } from "@galacticcouncil/ui/components"
import { containerQuery, css, styled } from "@galacticcouncil/ui/utils"

export const SVaultDetailsRow = styled(Flex)(
  ({ theme }) => css`
    flex-direction: column;
    align-items: stretch;
    gap: ${theme.space.xl};

    ${containerQuery(
      { conditions: [{ type: "inline-size", value: "48rem" }] },
      css`
        flex-direction: row;
      `,
    )}
  `,
)
