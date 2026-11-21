import { containerSize, css, pxToRem, styled } from "@galacticcouncil/ui/utils"

// the min width of a stat column while the stats wrap under the value
const STAT_COLUMN_WIDTH = 150

// As the looper's positions: wrapped under the value (narrow card), the stats
// take even columns; on one row (PositionCard's md) they spread out evenly.
export const SStats = styled.div(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: repeat(
      auto-fill,
      minmax(${pxToRem(STAT_COLUMN_WIDTH)}, 1fr)
    );
    gap: ${theme.space.l};

    ${containerSize(
      "md",
      css`
        display: flex;
        justify-content: space-evenly;
        gap: ${theme.space.xxl};
      `,
    )}
  `,
)
