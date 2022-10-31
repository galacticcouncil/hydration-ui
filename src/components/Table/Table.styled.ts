import styled from "@emotion/styled"
import { theme } from "theme"

export const STableContainer = styled.div`
  background: linear-gradient(
      180deg,
      rgba(35, 56, 55, 0.3) 0%,
      rgba(0, 0, 0, 0) 100%
    ),
    #16171c;
  border-radius: 20px;
  overflow: hidden;
`

export const STable = styled.table`
  width: 100%;
  border-spacing: 0;
`

export const STableTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 24px 32px;
  border-bottom: 1px solid rgba(${theme.rgbColors.white}, 0.06);
`

export const STableHeaderContent = styled.thead``

export const STableBodyContent = styled.tbody`
  position: relative;
`

export const STablePlaceholderContent = styled.div`
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
`

export const STableRow = styled.tr<{ isOdd?: boolean; isSub?: boolean }>`
  ${({ isOdd }) => isOdd && `background: rgba(${theme.rgbColors.white}, 0.03);`}
  ${({ isSub }) => isSub && `background: rgba(${theme.rgbColors.white}, 0.06);`}
`

export const STableHeader = styled.th<{ canSort?: boolean }>`
  padding: 24px 32px;

  font-size: 12px;
  line-height: 16px;
  font-weight: 600;

  text-transform: uppercase;
  text-align: start;
  color: ${theme.colors.neutralGray500};

  ${({ canSort }) => canSort && "cursor:pointer;"}
`

export const STableData = styled.td<{ isExpanded?: boolean }>`
  padding: 24px 32px;
  text-align: start;

  ${({ isExpanded }) =>
    isExpanded && `background: rgba(${theme.rgbColors.white}, 0.06);`}

  // shrink actions column
  &:last-of-type {
    width: 0;
    padding-right: 10px;
  }
`
