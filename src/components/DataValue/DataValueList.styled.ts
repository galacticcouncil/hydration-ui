import styled from "@emotion/styled"
import { theme } from "theme"
import { ResponsiveValue } from "utils/responsive"

export const SDataValueList = styled.div<{
  separated?: boolean
  gap?: ResponsiveValue<number>
}>`
  display: flex;
  flex-direction: column;

  ${({ separated }) => separated && "gap: 0!important"};

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
    flex-direction: row;

    & > div {
      display: flex;
      align-items: center;

      flex: ${({ separated }) => (separated ? "1 1 auto" : "0")};
      position: relative;

      border-bottom: none;
      padding: 0;

      &:not(:last-child):after {
        ${({ separated }) => (separated ? 'content: "";' : "")}
        border-left: 1px solid rgba(${theme.rgbColors.white}, 0.12);
        height: 90%;
        margin: auto;
      }

      &:last-child {
        flex: 0;
      }

      & > div {
        flex-direction: column;
        align-items: flex-start;
        align-self: start;
      }
    }
  }
`
