import styled from "@emotion/styled"
import { theme } from "theme"

export const SNavigationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  height: 42px;
  max-width: var(--content-width);

  padding: 0 8px;
  margin: 0 auto;

  @media (${theme.viewport.gte.sm}) {
    gap: 42px;
    justify-content: flex-start;

    padding: 0 20px;
  }
`

export const STabContainer = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  justify: space-between;

  height: 100%;

  position: relative;
`
