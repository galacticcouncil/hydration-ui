import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { ColumnPinningPosition } from "@tanstack/react-table"

import { Box } from "@/components/Box"
import { Separator } from "@/components/Separator"
import { createStyles, createVariants } from "@/utils"

export type TableSize = "small" | "medium" | "large"
export type TableProps = {
  size?: TableSize
  borderless?: boolean
  fixedLayout?: boolean
}

const columnSizeStyles = createVariants<TableSize>((theme) => ({
  small: css`
    --table-column-padding-x: ${theme.space.l};

    height: 3.75rem;
    padding-inline: var(--table-column-padding-x);
    font-size: ${theme.fontSizes.p5};
  `,
  medium: css`
    --table-column-padding-x: ${theme.space.l};

    height: 4.375rem;
    padding-inline: var(--table-column-padding-x);
    font-size: ${theme.fontSizes.p4};
  `,
  large: css`
    --table-column-padding-x: ${theme.space.xl};

    height: 5.25rem;
    padding-inline: var(--table-column-padding-x);
    font-size: ${theme.fontSizes.p3};
  `,
}))

const pinnedColumnStyles = createVariants<ColumnPinningPosition>(() => ({
  left: css`
    left: 0;
  `,
  right: css`
    right: 0;
  `,
}))

export const SExpandedTableRowHorizontalSeparator = styled(Separator)`
  margin-inline: calc(-1 * var(--table-column-padding-x));
`

const headSizeStyles = createVariants<TableSize>((theme) => ({
  small: css`
    height: 2.75rem;
    padding: 0 ${theme.space.l};
    font-size: ${theme.fontSizes.p6};
  `,
  medium: css`
    height: 3.125rem;
    padding: 0 ${theme.space.l};
    font-size: ${theme.fontSizes.p5};
  `,
  large: css`
    height: 3.125rem;
    padding: 0 ${theme.space.xl};
    font-size: ${theme.fontSizes.p5};
  `,
}))

const borderStyles = createStyles(
  (theme) => css`
    tbody tr {
      border-top: 1px solid ${theme.details.separators};
    }
  `,
)

export const TableContainer = styled(Box)`
  width: 100%;
  overflow-x: auto;
  position: relative;
`

export const Table = styled.table<TableProps>(
  ({ theme, size = "medium", fixedLayout = false, borderless = false }) => {
    return [
      !borderless && borderStyles,
      css`
        width: 100%;
        border-spacing: 0;
        border-collapse: collapse;

        ${fixedLayout && "table-layout: fixed;"}

        thead th,
        tbody td {
          white-space: nowrap;
        }

        thead th {
          ${headSizeStyles(size)({ theme })}
        }

        tbody td {
          ${columnSizeStyles(size)({ theme })}
        }

        &[data-loading="true"] {
          pointer-events: none;
        }
      `,
    ]
  },
)

export const TableHeader = styled.thead()
export const TableBody = styled.tbody()

export const TableRow = styled.tr<{
  readonly isClickable?: boolean
  readonly isExpandable?: boolean
  readonly hasOverride?: boolean
  readonly isEmptyState?: boolean
}>(
  ({ theme, isClickable, isExpandable, hasOverride, isEmptyState }) => css`
    &[data-expanded="true"],
    &[data-expanded="true"] + tr {
      background: ${theme.surfaces.containers.high.primary};
    }

    ${!isEmptyState &&
    (isClickable || isExpandable) &&
    css`
      ${TableBody} &:hover {
        background: ${theme.surfaces.containers.high.hover};
        transition: ${theme.transitions.colors};
        ${TableCell}[data-pinned] {
          background: ${theme.surfaces.containers.high.hover};
          transition: ${theme.transitions.colors};
        }
      }
    `}
    color: ${theme.text.medium};
    background-color: ${theme.surfaces.containers.high.primary};

    ${isClickable &&
    css`
      cursor: pointer;
    `}
    ${isExpandable &&
    css`
      cursor: pointer;
      align-items: center;
    `}
      ${hasOverride &&
    css`
      position: relative;
      pointer-events: none;
    `};
  `,
)
export const TableCell = styled.td<{
  isPinned?: ColumnPinningPosition
  isClickable?: boolean
}>(({ theme, isPinned, isClickable }) => {
  if (isPinned) {
    return [
      pinnedColumnStyles(isPinned),
      css`
        background-color: inherit;
        position: sticky;
        z-index: 1;

        ${isClickable &&
        css`
          tr:hover & {
            background: ${theme.surfaces.containers.high.hover};
          }
        `}
      `,
    ]
  }
})

export const TableHead = styled.th<{
  canSort?: boolean
  isPinned?: ColumnPinningPosition
  isSorting?: boolean
}>(
  ({ theme, canSort, isPinned, isSorting }) => css`
    text-align: start;
    font-weight: 500;
    color: ${isSorting ? theme.text.medium : theme.text.low};
    ${canSort && "cursor:pointer;"}
    ${isPinned && [
      pinnedColumnStyles(isPinned)({ theme }),
      css`
        background-color: inherit;
        position: sticky;
        z-index: 1;
      `,
    ]};
  `,
)

export const TableHeadSortIndicator = styled.div(
  ({ theme }) => css`
    display: inline-block;
    position: relative;
    width: ${theme.sizes.xs};
    height: ${theme.sizes.xs};
    margin-left: ${theme.space.s};
    vertical-align: middle;

    & > svg {
      position: absolute;
      left: 0;

      width: 0.45rem;
      height: 0.45rem;

      &:first-of-type {
        bottom: -1px;
      }

      &:last-of-type {
        top: -1px;
        transform: rotate(180deg);
      }
    }
  `,
)

export const TableRowOverride = styled(TableCell)`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  transform: translate(-50%, -50%);
  backdrop-filter: blur(10px);
  pointer-events: auto;
`
