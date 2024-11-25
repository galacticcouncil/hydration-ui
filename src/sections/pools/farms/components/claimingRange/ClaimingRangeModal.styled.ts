import styled from "@emotion/styled"
import { theme } from "theme"

export const SLabelContainer = styled.div`
  border-radius: ${theme.borderRadius.default}px;

  background: linear-gradient(0deg, #fc408c -3.48%, #efb0ff 97.39%);

  display: flex;
  align-items: center;
  justify-container: center;

  padding: 0 40px;
`

export const SInputContainer = styled.div`
  border-radius: ${theme.borderRadius.default}px;

  background: rgba(${theme.rgbColors.white}, 0.06);

  display: flex;
  flex-direction: column;

  gap: 8px;

  padding: 10px 8px;
`
