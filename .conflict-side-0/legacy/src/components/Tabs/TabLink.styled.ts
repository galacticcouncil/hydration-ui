import styled from "@emotion/styled"
import { Button } from "components/Button/Button"
import { theme } from "theme"

export const SButton = styled(Button)`
  @media ${theme.viewport.gte.sm} {
    min-width: 140px;
  }
`
