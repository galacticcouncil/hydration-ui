import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  width: 100%;

  padding: 30px;
  
  border-radius: 4px;
  background-color: ${theme.colors.darkBlue700};
  box-shadow: ${theme.shadows.contentBox};

  overflow: hidden;
`
