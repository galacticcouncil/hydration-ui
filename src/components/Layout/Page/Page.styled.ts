import styled from "@emotion/styled"
import { theme } from "theme"

export const SPage = styled.div`
  --mobile-nav-height: calc(60px + env(safe-area-inset-bottom));
  --nav-height: 65px;
  --content-width: 1109px;

  position: relative;

  display: flex;
  flex-direction: column;

  height: 100vh;

  background: ${theme.colors.bg};

  @media ${theme.viewport.gte.sm} {
    --nav-height: 70px;

    overflow-y: auto;
  }
`

export const SGradientBg = styled.div`
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;

  height: 474px;
  background: ${theme.gradients.background};
`

export const SPageContent = styled.main`
  position: relative;

  overflow-x: hidden;

  display: flex;
  flex-direction: column;
  flex-grow: 1;

  padding-bottom: var(--mobile-nav-height);

  ::-webkit-scrollbar {
    width: 0px;
  }

  ::-webkit-scrollbar-track {
    margin-top: var(--nav-height);
  }

  @media ${theme.viewport.gte.sm} {
    padding: 0 20px;
    padding-bottom: var(--mobile-nav-height);

    display: block;

    ::-webkit-scrollbar {
      width: 6px;
    }
  }

  @media ${theme.viewport.gte.md} {
    padding-bottom: 0;

    display: block;
  }
`

export const SPageInner = styled.div`
  padding: 16px 12px;

  display: flex;
  flex-direction: column;
  flex-grow: 1;

  position: relative;

  @media ${theme.viewport.gte.sm} {
    padding: 44px 20px;

    max-width: var(--content-width);
    margin: 0 auto;

    display: block;
  }
`

export const SSubHeader = styled.div`
  border-bottom: solid 1px rgba(114, 131, 165, 0.6);

  width: 100vw;

  position: relative;
  z-index: 1;

  @media (${theme.viewport.gte.sm}) {
    margin: 0 -20px;
  }
`
