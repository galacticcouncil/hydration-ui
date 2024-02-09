import styled from "@emotion/styled"
import { theme } from "theme"
import { Text } from "components/Typography/Text/Text"

export const SText = styled(Text)`
  white-space: nowrap;
`

export const DataValueList = styled.div<{ separated?: boolean }>`
  & > div {
    padding: ${({ separated }) => (separated ? `14px 0` : "4px 0")};
    border-bottom: ${({ separated }) =>
      separated ? `1px solid rgba(${theme.rgbColors.white}, 0.12)` : "none"};

    &:first-of-type {
      padding-top: 0;
    }

    &:last-of-type {
      border-bottom: none;
    }

    & > div {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  @media ${theme.viewport.gte.sm} {
    display: flex;
    gap: ${({ separated }) => (separated ? "0" : "40px")};

    & > div {
      display: flex;
      align-items: center;
      flex: ${({ separated }) => (separated ? "1 1 0" : "0")};
      position: relative;

      border-bottom: none;
      padding: 0;

      &:not(:last-child):after {
        ${({ separated }) => (separated ? 'content: "";' : "")}
        border-left: 1px solid rgba(${theme.rgbColors.white}, 0.12);
        height: 50px;
        margin: auto;
      }

      &:last-child {
        flex: 0;
      }

      & > div {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  }
`
