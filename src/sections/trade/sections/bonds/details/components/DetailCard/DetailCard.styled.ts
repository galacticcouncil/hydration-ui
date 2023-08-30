import styled from "@emotion/styled"
import { gradientBorder } from "theme"

export const DetailCardContainer = styled.div`
  ${gradientBorder}

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1 0 auto;

  padding: 30px;

  min-height: 150px;

  &:before {
    border-radius: 8px;
  }
`
