import styled from "@emotion/styled"
import { gradientBorder, theme } from "theme"

export const DetailCardContainer = styled.div`
  ${gradientBorder}

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex: 1 0 auto;

  padding: 14px 20px;

  &:before {
    border-radius: 8px;
  }

  @media (${theme.viewport.gte.sm}) {
    flex-direction: column;
    align-items: start;
    min-height: 120px;

    padding: 20px;
  }
`
