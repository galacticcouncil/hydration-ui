import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;

  padding: 16px 46px 16px 26px;

  background-color: rgba(${theme.rgbColors.primary450}, 0.12);
`
