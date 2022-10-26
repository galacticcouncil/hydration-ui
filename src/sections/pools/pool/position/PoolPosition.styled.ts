import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr;
  grid-column-gap: 8px;
`

export const SMobContiner = styled.div`
  padding: 20px;

  background-color: rgba(${theme.rgbColors.white}, 0.08);

  border: 1px solid rgba(${theme.rgbColors.white}, 0.12);
  border-radius: 14px;
`
