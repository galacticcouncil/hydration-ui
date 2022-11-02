import styled from "@emotion/styled"
import { theme } from "theme"

export const SIcon = styled.div`
  &,
  svg {
    width: 24px;
    height: 24px;
  }

  @media (${theme.viewport.gte.sm}) {
    &,
    svg {
      width: 32px;
      height: 32px;
    }
  }
`
