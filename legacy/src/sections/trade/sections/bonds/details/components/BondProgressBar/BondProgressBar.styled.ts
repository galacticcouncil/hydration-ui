import { gradientBorder, theme } from "theme"
import styled from "@emotion/styled"

export const ProgressBarContainer = styled.div`
  ${gradientBorder};

  display: flex;
  flex-direction: column;

  gap: 12px;

  padding: 20px 30px;

  border-radius: 8px;

  &:before {
    border-radius: 8px;
  }

  @media (${theme.viewport.gte.sm}) {
    align-items: center;
  }
`
