import styled from "@emotion/styled"
import { theme } from "theme"

export const SNavigationContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 6px;

  height: 42px;
  max-width: var(--content-width);

  padding: 0 8px;
  margin: 0 auto;

  overflow-x: scroll;
  overflow-y: hidden;

  @media (${theme.viewport.gte.sm}) {
    gap: 42px;

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
