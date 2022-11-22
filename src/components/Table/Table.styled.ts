import styled from "@emotion/styled"
import { theme } from "theme"

export const TableContainer = styled.div`
  background: linear-gradient(
      180deg,
      rgba(35, 56, 55, 0.3) 0%,
      rgba(0, 0, 0, 0) 100%
    ),
    #16171c;
  border-radius: 20px;
  overflow: hidden;
`

export const Table = styled.table`
  width: 100%;
  border-spacing: 0;
`

export const TableTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 14px 20px;
  border-bottom: 1px solid rgba(${theme.rgbColors.white}, 0.06);

  @media ${theme.viewport.gte.sm} {
    padding: 24px 32px;
  }
`

export const TableHeaderContent = styled.thead``

export const TableBodyContent = styled.tbody`
  position: relative;
`

export const TablePlaceholderContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: ${theme.zIndices.tablePlaceholder};

  width: 100%;
  height: 100%;

  display: grid;
  place-items: center;

  background: rgba(${theme.rgbColors.black}, 0.5);
  backdrop-filter: blur(7px);

  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`

export const TableRow = styled.tr<{ isOdd?: boolean; isSub?: boolean }>`
  ${({ isOdd }) => isOdd && `background: rgba(${theme.rgbColors.white}, 0.03);`}
  ${({ isSub }) => isSub && `background: rgba(${theme.rgbColors.white}, 0.06);`}
`

export const TableHeader = styled.th<{ canSort?: boolean }>`
  padding: 10px 16px;

  font-size: 11px;
  line-height: 14px;
  font-weight: 500;

  text-transform: uppercase;
  text-align: start;
  color: ${theme.colors.neutralGray500};
  white-space: nowrap;

  ${({ canSort }) => canSort && "cursor:pointer;"}

  @media ${theme.viewport.gte.sm} {
    padding: 24px 32px;

    font-size: 12px;
    line-height: 16px;
    font-weight: 600;
  }
`

export const TableData = styled.td<{ isExpanded?: boolean }>`
  padding: 16px;
  padding-right: 0;
  text-align: start;

  ${({ isExpanded }) =>
    isExpanded && `background: rgba(${theme.rgbColors.white}, 0.06);`}

  // shrink actions column
  &:last-of-type {
    width: 0;
    padding-right: 10px;
  }

  @media ${theme.viewport.gte.sm} {
    padding: 24px 32px;
  }
`
