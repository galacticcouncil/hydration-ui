import { Box, Flex } from "@galacticcouncil/ui/components"
import { containerSize, css, styled } from "@galacticcouncil/ui/utils"

export const SBorrowsContent = styled(Flex)(
  ({ theme }) => css`
    flex-direction: column;
    gap: ${theme.space.s};

    ${containerSize(
      "md",
      css`
        flex-direction: row;
        gap: ${theme.space.xl};
      `,
    )}
  `,
)

export const SBorrowPanel = styled(Flex)(
  ({ theme }) => css`
    justify-content: space-between;
    padding-inline: ${theme.space.l};
    padding-block: ${theme.space.xl};
    min-width: 0;

    ${containerSize(
      "md",
      css`
        flex: 1;
      `,
    )}
  `,
)

export const SBorrowsSeparator = styled(Box)(
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
