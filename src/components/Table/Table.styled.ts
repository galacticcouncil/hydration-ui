import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { theme } from "theme"

export const TableContainer = styled.div`
  background: #111320;
  overflow: hidden;

  margin: 0 -13px;

  border: 1px solid rgba(152, 176, 214, 0.27);

  @media ${theme.viewport.gte.sm} {
    border-radius: ${theme.borderRadius.medium}px;

    margin: unset;
  }
`

export const StatsTableContainer = styled.div`
  overflow: hidden;
  position: relative;

  border-radius: ${theme.borderRadius.stakingCard}px;
  border: 1px solid rgba(152, 176, 214, 0.27);
`

export const Table = styled.table`
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
`

export const TableTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 14px 20px;
  border-bottom: 1px solid rgba(${theme.rgbColors.white}, 0.06);

  @media ${theme.viewport.gte.sm} {
    padding: 24px 30px;
  }
`

export const StatsTableTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 14px 20px;

  border-bottom: 1px solid #202135;

  @media ${theme.viewport.gte.sm} {
    padding: 24px 30px 0px;

    border-bottom: none;
  }
`

export const TableHeaderContent = styled.thead``

export const TableBodyContent = styled.tbody`
  position: relative;
`

export const TablePlaceholderContent = styled.div`
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  z-index: ${theme.zIndices.tablePlaceholder};

  display: grid;
  place-items: center;

  background: rgba(11, 13, 25, 0.6);
  backdrop-filter: blur(8px);
`

export const TableRow = styled.tr<{
  isOdd?: boolean
  isSub?: boolean
  header?: boolean
}>`
  transition: ${theme.transitions.slow};

  :hover {
    ${({ header }) =>
      !header && `background: rgba(${theme.rgbColors.white}, 0.06);`}
  }
  ${({ isOdd }) => isOdd && `background: rgba(${theme.rgbColors.white}, 0.03);`}
  ${({ isSub }) => isSub && `background: rgba(${theme.rgbColors.white}, 0.06);`}
`

export const TableRowStats = styled.tr<{
  isOdd?: boolean
  isSub?: boolean
  header?: boolean
}>`
  transition: ${theme.transitions.slow};

  border-bottom: 1px solid #202135;

  ${({ header }) =>
    !header &&
    css`
      :hover {
        background: rgba(${theme.rgbColors.white}, 0.06);
      }

      &:last-of-type {
        border-bottom: none;
      }
    `}
`

export const TableHeader = styled.th<{ canSort?: boolean }>`
  padding: 10px 0 10px 16px;

  font-size: 11px;
  line-height: 14px;
  font-weight: 500;

  text-transform: uppercase;
  text-align: start;
  color: rgba(${theme.rgbColors.white}, 0.7);
  color: ${theme.colors.basic600};

  ${({ canSort }) => canSort && "cursor:pointer;"}

  &:last-of-type {
    padding-right: 16px;
  }

  @media ${theme.viewport.gte.sm} {
    padding: 24px 32px;

    font-size: 12px;
    line-height: 16px;
    font-weight: 600;
  }
`

export const TableData = styled.td<{
  isExpanded?: boolean
  isSkeleton?: boolean
}>`
  padding: 16px;
  ${({ isSkeleton }) => !isSkeleton && "padding-right: 0px;"}
  text-align: start;

  ${({ isExpanded }) =>
    isExpanded && `background: rgba(${theme.rgbColors.white}, 0.06);`}

  &:last-of-type {
    width: 0;
  }

  @media ${theme.viewport.gte.sm} {
    padding: 24px 32px;

    &:last-of-type {
      padding-right: 10px;
    }
  }
`
