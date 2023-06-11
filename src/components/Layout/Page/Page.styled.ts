import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { theme } from "theme"

export const SPage = styled.div<{ variant?: "stats" | "default" }>`
  --mobile-nav-height: calc(60px + env(safe-area-inset-bottom));
  --nav-height: 65px;

  position: relative;

  display: flex;
  flex-direction: column;

  height: 100vh;

  background: ${theme.colors.bg};

  ${({ variant }) =>
    variant === "stats"
      ? css`
          & > div {
            height: 1360px;
            background: ${theme.gradients.backgroundStats};
          }
        `
      : css`
          & > div {
            height: 474px;
            background: ${theme.gradients.background};
          }
        `}

  @media ${theme.viewport.gte.sm} {
    --nav-height: 70px;

    overflow-y: overlay;
  }
`

export const SPageContent = styled.main`
  position: relative;

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

export const SPageGrid = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;

  opacity: 0.06;
  pointer-events: none;

  background-size: 22px 22px;
  background-image: linear-gradient(to right, white 1px, transparent 1px),
    linear-gradient(to bottom, white 1px, transparent 1px);
  mask-image: linear-gradient(180deg, #d9d9d9 0%, rgba(217, 217, 217, 0) 100%);
`
