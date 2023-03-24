import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  padding: 28px 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  @media (${theme.viewport.lt.sm}) {
    padding: 14px 28px;
    height: 100%;
    justify-content: center;
  }
`
