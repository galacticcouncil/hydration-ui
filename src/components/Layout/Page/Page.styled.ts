import styled from "@emotion/styled"
import { theme } from "theme"

export const SPage = styled.div`
  position: relative;

  background: ${theme.gradients.verticalGradient};
  min-height: 100vh;

  display: flex;
  flex-direction: column;
`

export const SPageContent = styled.main`
  overflow-y: auto;
  padding: 0 12px;
  overflow-x: hidden;

  @media (${theme.viewport.gte.sm}) {
    padding: 0 20px;
  }
`

export const SPageInner = styled.div`
  padding: 16px 0;
  max-width: 1109px;
  margin: 0 auto;

  @media (${theme.viewport.gte.sm}) {
    padding: 44px 0;
  }
`
