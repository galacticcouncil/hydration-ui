import { Flex } from "@galacticcouncil/ui/components"
import { containerQuery, css, styled } from "@galacticcouncil/ui/utils"

/**
 * Container queries, not viewport ones: what decides whether these cards can
 * sit next to each other is the width of the column they live in, not the
 * width of the window.
 */

/** Composition + explainer cards. Needs ~48rem of column to split in two. */
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

/** Chart beside text inside the explainer card. */
export const SExplainerSplit = styled(Flex)(css`
  flex-direction: column;
  align-items: stretch;

  ${containerQuery(
    { conditions: [{ type: "inline-size", value: "36rem" }] },
    css`
      flex-direction: row;
    `,
  )}
`)

/**
 * Divider of the split above. `Separator`'s orientation is resolved in JS from
 * viewport media queries, so it cannot follow a container query — hence a plain
 * rule that flips its own axis in CSS.
 */
export const SExplainerSplitDivider = styled.div(
  ({ theme }) => css`
    align-self: stretch;
    width: auto;
    height: 1px;
    margin-block: ${theme.space.l};
    background: ${theme.details.separators};

    ${containerQuery(
      { conditions: [{ type: "inline-size", value: "36rem" }] },
      css`
        width: 1px;
        height: auto;
        margin-block: 0;
        margin-inline: ${theme.space.xl};
      `,
    )}
  `,
)
