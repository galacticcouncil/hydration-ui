import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  margin-top: 42px;
  padding-bottom: 76px;

  overflow-x: hidden;
  overflow-y: auto;

  @media ${theme.viewport.gte.sm} {
    max-height: 465px;
  }

  &::-webkit-scrollbar-track {
    margin-bottom: 76px;
  }
`
