import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { Box } from "@/components/Box"
import { Separator } from "@/components/Separator"
import { createStyles, createVariants } from "@/utils"

export type TableSize = "small" | "medium" | "large"
export type TableProps = {
  size?: TableSize
  hoverable?: boolean
  borderless?: boolean
  fixedLayout?: boolean
}

const columnSizeStyles = createVariants((theme) => ({
  small: css`
    --table-column-padding-x: 16px;
    height: 44px;
    padding: 0 var(--table-column-padding-x);
    font-size: ${theme.paragraphSize.p5};
  `,
  medium: css`
    --table-column-padding-x: 18px;
    height: 54px;
    padding: 0 var(--table-column-padding-x);
    font-size: ${theme.paragraphSize.p4};
  `,
  large: css`
    --table-column-padding-x: 20px;
    height: 68px;
    padding: 0 var(--table-column-padding-x);
    font-size: ${theme.paragraphSize.p3};
  `,
}))

export const SExpandedTableRowHorizontalSeparator = styled(Separator)`
  margin-inline: calc(-1 * var(--table-column-padding-x));
`

const headSizeStyles = createVariants((theme) => ({
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

const hoverStyles = createStyles(
  (theme) => css`
    tbody tr:hover {
      transition: ${theme.transitions.colors};
      background: ${theme.surfaces.containers.dim.dimOnBg};
    }
  `,
)

export const TableContainer = styled(Box)`
  width: 100%;
  overflow-x: auto;
  position: relative;
`

export const Table = styled.table<TableProps>(
  ({
    theme,
    size = "medium",
    fixedLayout = false,
    borderless = false,
    hoverable = false,
  }) => {
    return [
      !borderless && borderStyles,
      hoverable && hoverStyles,
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
}>(
  ({ theme, isClickable, isExpandable, hasOverride }) => css`
    &[data-expanded="true"],
    &[data-expanded="true"] + tr {
      background: ${theme.surfaces.containers.dim.dimOnBg};
    }

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
    `}
  `,
)
export const TableCell = styled.td()

export const TableHead = styled.th<{ canSort?: boolean }>`
  text-align: start;
  font-weight: 500;
  color: ${({ theme }) => theme.text.low};

  ${({ canSort }) => canSort && "cursor:pointer;"}
`

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
