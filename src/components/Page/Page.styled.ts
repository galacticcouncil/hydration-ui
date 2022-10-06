import styled from "@emotion/styled"
import { theme } from "theme"

export const SPage = styled.div`
  background: ${theme.gradients.verticalGradient};
  height: 100vh;
  // overflow-y: auto;
  display: flex;
  flex-direction: column;
`
export const PageContent = styled.div`
  overflow-y: auto;
  padding: 0 20px;
`
export const PageInner = styled.div`
  padding: 44px 0;
  max-width: 1109px;
  margin: 0 auto;
`
