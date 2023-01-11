import styled from "@emotion/styled"
import { theme } from "theme"

export const SPage = styled.div`
  --mobile-nav-height: calc(60px + env(safe-area-inset-bottom));
  --nav-height: 65px;

  position: relative;

  display: flex;
  flex-direction: column;

  height: 100vh;

  background: ${theme.gradients.background};

  @media ${theme.viewport.gte.sm} {
    --nav-height: 70px;
  }
`

export const SPageContent = styled.main`
  overflow-y: auto;
  padding: 0 12px;
  overflow-x: hidden;

  display: flex;
  flex-direction: column;
  flex-grow: 1;

  padding-top: var(--nav-height);
  padding-bottom: var(--mobile-nav-height);

  ::-webkit-scrollbar {
    width: 0px;
  }

  ::-webkit-scrollbar-track {
    margin-top: var(--nav-height);
  }

  @media ${theme.viewport.gte.sm} {
    padding: 0 20px;
    padding-top: var(--nav-height);

    display: block;

    ::-webkit-scrollbar {
      width: 6px;
    }
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
