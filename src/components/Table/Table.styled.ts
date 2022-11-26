import styled from "@emotion/styled"
import { theme } from "theme"

export const TableContainer = styled.div`
  background: #111320;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: ${theme.shadows.boxShadowTable};

  background-image: radial-gradient(
      circle at 100% 100%,
      transparent 3px,
      rgba(144, 165, 198, 0.3) 3px,
      rgba(144, 165, 198, 0.3) 4px,
      transparent 4px
    ),
    linear-gradient(
      to right,
      rgba(144, 165, 198, 0.3),
      rgba(144, 165, 198, 0.3)
    ),
    radial-gradient(
      circle at 0% 100%,
      transparent 3px,
      rgba(144, 165, 198, 0.3) 3px,
      rgba(144, 165, 198, 0.3) 4px,
      transparent 4px
    ),
    linear-gradient(to bottom, rgba(144, 165, 198, 0.3), rgba(158, 167, 180, 0)),
    radial-gradient(
      circle at 0% 0%,
      transparent 3px,
      rgba(158, 167, 180, 0) 3px,
      rgba(158, 167, 180, 0) 4px,
      transparent 4px
    ),
    linear-gradient(to left, rgba(158, 167, 180, 0), rgba(158, 167, 180, 0)),
    radial-gradient(
      circle at 100% 0%,
      transparent 3px,
      rgba(158, 167, 180, 0) 3px,
      rgba(158, 167, 180, 0) 4px,
      transparent 4px
    ),
    linear-gradient(to top, rgba(158, 167, 180, 0), rgba(144, 165, 198, 0.3));
  background-size: 4px 4px, calc(100% - 8px) 1px, 4px 4px, 1px calc(100% - 8px);
  background-position: top left, top center, top right, center right,
    bottom right, bottom center, bottom left, center left;

  background-repeat: no-repeat;
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
    padding: 24px 30px;
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

  background: rgba(${theme.rgbColors.black}, 0.5);
  backdrop-filter: blur(8px);
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
  color: rgba(${theme.rgbColors.white}, 0.7);
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
