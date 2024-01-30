import styled from "@emotion/styled"
import { theme } from "theme"

export const SPoolContainer = styled.div`
  width: calc(100% + 24px);

  border: 1px solid rgba(152, 176, 214, 0.27);
  background-color: ${theme.colors.darkBlue700};

  overflow: hidden;

  margin: 0 -12px;

  position: relative;
  height: 100%;

  @media ${theme.viewport.gte.sm} {
    margin: 0 auto;

    width: 730px;
    height: auto;

    border-radius: ${theme.borderRadius.medium}px;
  }
`
