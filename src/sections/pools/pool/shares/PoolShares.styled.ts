import styled from "styled-components"
import { theme } from "theme"

export const SContainer = styled.div`
  padding: 24px;

  color: currentColor;
  background-color: ${theme.colors.black};

  overflow: hidden;
`

export const SDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
`
