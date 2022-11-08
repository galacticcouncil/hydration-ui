import styled from "@emotion/styled"
import { Button } from "components/Button/Button"
import { theme } from "theme"

export const SContainer = styled.div`
  padding: 9px 9px 8px 14px;
  background: rgba(${theme.rgbColors.darkBlue900}, 0.6);
  cursor: pointer;

  flex-shrink: 0;
`

export const SLoginButton = styled(Button)`
  display: flex;
  gap: 16px;
  align-items: center;
  text-align: center;
  justify-content: center;
`
