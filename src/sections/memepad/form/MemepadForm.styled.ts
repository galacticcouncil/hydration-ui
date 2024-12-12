import styled from "@emotion/styled"
import { theme } from "theme"

export const FormFieldGrid = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr;

  @media ${theme.viewport.gte.sm} {
    grid-template-columns: 6fr 5fr;
  }
`
