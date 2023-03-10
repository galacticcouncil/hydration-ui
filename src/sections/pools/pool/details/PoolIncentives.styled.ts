import styled from "@emotion/styled"
import { theme } from "theme"

export const SInventivesContainer = styled.div`
  min-width: 200px;

  margin: 0 -20px;
  padding: 15px 20px 0;

  background: rgba(${theme.rgbColors.gray}, 0.69);

  @media (${theme.viewport.gte.sm}) {
    margin-left: 30px;
    padding-top: 0;

    background: inherit;
  }
`
