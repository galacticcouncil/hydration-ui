import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  --scrollbar-url: url("images/Scrollbar.svg");
  margin: 0 -12px;

  @media ${theme.viewport.gte.md} {
    margin: 0 -20px;

    gc-yield {
      max-width: 100%;
    }
  }

  @media ${theme.viewport.lt.xs} {
    display: flex;
    flex: 1;
    background: #111320;

    gc-yield {
      flex: 1;
    }
  }
`
