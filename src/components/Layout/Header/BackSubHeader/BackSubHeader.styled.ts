import styled from "@emotion/styled"
import { theme } from "theme"

export const NavigationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  height: 42px;
  max-width: var(--content-width);

  padding: 0 8px;
  margin: 0 auto;

  @media (${theme.viewport.gte.sm}) {
    gap: 10px;
    justify-content: flex-start;

    padding: 0 20px;
  }
`
