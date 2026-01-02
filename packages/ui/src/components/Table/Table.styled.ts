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
    --table-column-padding-x: 16px;

    padding: var(--table-column-padding-x);
    font-size: ${theme.paragraphSize.p5};
  `,
  medium: css`
    --table-column-padding-x: 18px;

    padding: var(--table-column-padding-x);
    font-size: ${theme.paragraphSize.p4};
  `,
  large: css`
    --table-column-padding-x: 20px;

    height: 84px;
    padding: var(--table-column-padding-x);
    font-size: ${theme.paragraphSize.p3};
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
    height: 44px;
    padding: 0 16px;
    font-size: ${theme.paragraphSize.p6};
  `,
  medium: css`
    height: 50px;
    padding: 0 18px;
    font-size: ${theme.paragraphSize.p5};
  `,
  large: css`
    height: 50px;
    padding: 0 20px;
    font-size: ${theme.paragraphSize.p5};
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
    isClickable &&
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

export const TableHeadSortIndicator = styled.div`
  display: inline-block;
  position: relative;
  width: 8px;
  height: 8px;
  margin-left: 6px;

  & > svg {
    position: absolute;
    left: 0;

    &:first-of-type {
      bottom: -2px;
    }

    &:last-of-type {
      top: -2px;
      transform: rotate(180deg);
    }
  }
`

export const TableRowOverride = styled(TableCell)`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  transform: translate(-50%, -50%);
  backdrop-filter: blur(10px);
  pointer-events: auto;
`
