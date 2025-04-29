import styled from "@emotion/styled"
import { theme } from "theme"

const SPACING = {
  small: `
    height: 40px;
    padding: 0 16px;
  `,
  medium: `
    height: 58px;
    padding: 0 16px;

    @media ${theme.viewport.gte.sm} {
      padding: 0 20px;
    }

    @container ${theme.viewport.lt.sm} {
      padding: 0 10px;
      &:first-of-type {
        padding-left: 20px;
      }
      &:last-of-type {
        padding-right: 20px;
      }
    }
  `,
  large: `
    height: 58px;
    padding: 0 16px;

    @media ${theme.viewport.gte.sm} {
      height: 68px;
      padding: 0 32px;
    }

    @container ${theme.viewport.lt.sm} {
      padding: 0 10px;
      &:first-of-type {
        padding-left: 20px;
      }
      &:last-of-type {
        padding-right: 20px;
      }
    }
  `,
}

const TITLE_SPACING = {
  small: `
    padding: 18px;
  `,
  medium: `
    padding: 18px;

    @media ${theme.viewport.gte.sm} {
      padding: 20px 20px;
    }
  `,
  large: `
    padding: 18px;

    @media ${theme.viewport.gte.sm} {
      padding: 24px 32px;
    }

    @container ${theme.viewport.lt.sm} {
      padding: 24px 20px;
    }
  `,
}

const SIZE = {
  small: `
    font-size: 12px;
  `,
  medium: `
    font-size: 14px;
  `,
  large: `
    font-size: 16px;
  `,
}

export type TableColumnSpacing = keyof typeof SPACING
export type TableSize = keyof typeof SIZE
export type TableProps = {
  striped?: boolean
  hoverable?: boolean
  borderless?: boolean
  spacing?: TableColumnSpacing
  size?: TableSize
  fixedLayout?: boolean
  background?: keyof typeof theme.colors | "transparent"
}

export const TableContainer = styled.div<Pick<TableProps, "background">>`
  --border-color: rgba(152, 176, 214, 0.27);
  container-type: inline-size;

  overflow-x: auto;
  position: relative;

  margin: 0 -12px;

  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);

  background: ${({ background }) =>
    background && background !== "transparent"
      ? theme.colors[background]
      : "transparent"};

  @media ${theme.viewport.gte.sm} {
    overflow-x: unset;

    border: 1px solid var(--border-color);
    border-radius: ${theme.borderRadius.medium}px;

    margin: unset;
  }
`

export const TableTitleContainer = styled.div<{
  spacing?: TableColumnSpacing
}>`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;

  ${({ spacing = "medium" }) => TITLE_SPACING[spacing]}
`

export const TableTitle = styled.div`
  font-family: "GeistMono";
  font-size: 14px;

  color: ${theme.colors.white};

  @media ${theme.viewport.gte.sm} {
    font-size: 16px;
  }
`

export const TableAddons = styled.div<{
  spacing?: TableColumnSpacing
}>`
  color: ${theme.colors.white};

  ${({ spacing = "medium" }) => TITLE_SPACING[spacing]}

  &:not(:first-of-type) {
    padding-top: 0;
  }
`

export const Table = styled.table<TableProps>`
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;

  &:not(:first-of-type) {
    border-top: 1px solid rgba(${theme.rgbColors.white}, 0.06);
  }

  ${({ fixedLayout }) => fixedLayout && "table-layout: fixed;"}
  ${({ spacing = "medium", size = "medium" }) => getColumnStyles(spacing, size)}
  ${({ borderless }) => !borderless && getBorderStyles()}
  ${({ striped }) => striped && getStripedStyles()}
  ${({ hoverable }) => hoverable && getHoverableStyles()}

  &[data-loading="true"] {
    pointer-events: none;
  }
`

export const TableHeader = styled.thead``

export const TableBody = styled.tbody`
  position: relative;
`

export const TableRow = styled.tr`
  transition: ${theme.transitions.slow};
`

export const TableHead = styled.th<{ canSort?: boolean }>`
  font-size: 11px !important;
  line-height: 14px;
  font-family: "GeistSemiBold";

  text-transform: uppercase;
  text-align: start;

  color: ${theme.colors.basic600};

  ${({ canSort }) => canSort && "cursor:pointer;"}
`

export const TableCell = styled.td`
  color: ${theme.colors.white};
`

function getBorderStyles() {
  return `
    tbody tr {
      border-top: 1px solid rgba(152, 176, 214, 0.15);
    }
  `
}

function getStripedStyles() {
  return `
    tbody tr:nth-of-type(odd) {
      background: rgba(${theme.rgbColors.white}, 0.03);
    }
  `
}

function getHoverableStyles() {
  return `
    tbody tr:hover {
      background: rgba(${theme.rgbColors.white}, 0.06);
    }
  `
}

function getColumnStyles(spacing: TableColumnSpacing, size: TableSize) {
  return `
    tbody td,
    thead th {
      white-space: nowrap;
      ${SPACING[spacing]}
      ${SIZE[size]}
    }

    thead th {
      height: 40px;
    }
  `
}
