import { Button } from "components/Button/Button"
import styled from "styled-components"
import { theme } from "theme"

export const StyledHeader = styled.header`
  background: rgba(${theme.rgbColors.backgroundGray1000}, 0.6);
  padding: 16px 30px;
`

export const StyledLoginButton = styled(Button)`
  display: flex;
  gap: 16px;
  align-items: center;
`
