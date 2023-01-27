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

  ::-webkit-scrollbar {
    width: 0px;
  }

  @media ${theme.viewport.gte.sm} {
    max-height: 465px;

    margin-right: -18px;

    ::-webkit-scrollbar {
      width: 6px;
    }
  }

  &::-webkit-scrollbar-track {
    margin-bottom: 76px;
    background: rgba(41, 41, 45, 0.5);
  }
`
