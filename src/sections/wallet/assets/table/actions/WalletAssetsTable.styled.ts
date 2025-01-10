import styled from "@emotion/styled"
import { theme } from "theme"

export const SActionButtonsContainer = styled.div`
  margin: calc(var(--modal-content-padding) * -1);
  padding: 0 12px 20px;

  background: rgba(${theme.rgbColors.darkBlue900}, 0.6);
`

export const SGridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  width: 100%;

  & > div:nth-child(odd) {
    text-align: left;
  }

  & > div:nth-child(even) {
    text-align: right;
  }
`
