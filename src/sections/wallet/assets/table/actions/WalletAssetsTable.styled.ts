import styled from "@emotion/styled"
import { IconButton } from "components/IconButton/IconButton"
import { theme } from "theme"

export const SMoreButton = styled(IconButton)`
  padding: 0 10px;
`

export const SActionButtonsContainer = styled.div`
  margin: 0 -20px -36px -20px;
  padding: 0 20px 36px 20px;

  background: rgba(${theme.rgbColors.darkBlue900}, 0.6);
`
