import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  padding: 16px;

  background: rgba(${theme.rgbColors.darkBlue401}, 0.8);
  border-radius: 4px;
`

export const SHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`
