import styled from "@emotion/styled"
import { Button } from "components/Button/Button"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  justify-content: start;
  gap: 10px;

  margin-left: -12px;
  margin-right: -12px;
  margin-bottom: 16px;
  padding: 0 12px;

  overflow-x: auto;

  @media ${theme.viewport.gte.sm} {
    margin-left: 0;
    margin-right: 0;
    margin-bottom: 30px;
    padding: 0;

    overflow-x: visible;
  }
`

export const SButton = styled(Button)`
  @media ${theme.viewport.gte.sm} {
    min-width: 140px;
  }
`
