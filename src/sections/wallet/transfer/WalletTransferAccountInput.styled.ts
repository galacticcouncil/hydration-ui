import { theme } from "theme"
import styled from "@emotion/styled"

export const SIconContainer = styled.div`
  background: ${theme.colors.black};
  display: flex;
  flex-direction: column;

  align-items: center;

  border-radius: 9999px;
  padding: 3px;

  @media ${theme.viewport.gte.md} {
    padding: 8px;

    & > *,
    & svg {
      width: 42px;
      height: 42px;
    }
  }
`
