import styled from "@emotion/styled"
import { theme } from "theme"

export const SPage = styled.div`
  --mobile-nav-height: calc(60px + env(safe-area-inset-bottom));

  position: relative;

  display: flex;
  flex-direction: column;

  min-height: 100vh;
  padding-bottom: var(--mobile-nav-height);

  background: ${theme.gradients.background};

  @media ${theme.viewport.gte.sm} {
    padding-bottom: 0;
  }
`

export const SPageContent = styled.main`
  overflow-y: auto;
  padding: 0 12px;
  overflow-x: hidden;

  display: flex;
  flex-direction: column;
  flex-grow: 1;

  @media ${theme.viewport.gte.sm} {
    padding: 0 20px;

    display: block;
  }
`

export const SPageInner = styled.div`
  padding: 16px 0;

  display: flex;
  flex-direction: column;
  flex-grow: 1;

  @media ${theme.viewport.gte.sm} {
    padding: 44px 0;

    max-width: 1109px;
    margin: 0 auto;

    display: block;
  }
`
