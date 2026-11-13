import { containerSize, css, pxToRem, styled } from "@galacticcouncil/ui/utils"

// the card's summary row; clicking it expands the details
export const SPositionHeader = styled.div(
  ({ theme }) => css`
    cursor: pointer;
    border-radius: ${theme.radii.m};

    /* PositionCard (ResponsiveScope > Paper) paints the same translucent
       surface as the card around it; doubled, the header turns darker */
    & > div > div {
      background-color: transparent;
    }

    &:focus-visible {
      outline: 2px solid ${theme.controls.outline.active};
      outline-offset: 2px;
    }
  `,
)

export const SChevron = styled.span<{ isOpen: boolean }>(
  ({ theme, isOpen }) => css`
    display: inline-flex;
    color: ${theme.text.low};
    transition: ${theme.transitions.transform};
    transform: rotate(${isOpen ? 180 : 0}deg);
  `,
)

// the min width of a value column, in the stats and in the details below them
export const STAT_COLUMN_WIDTH = 150

// Wrapped under the value (narrow card), the stats take the details' columns
// so the two line up; on one row (PositionCard's md) they spread out evenly.
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
