import styled from "@emotion/styled"
import { Button } from "components/Button/Button"
import { theme } from "theme"

export const SContainer = styled.div`
  border-radius: 13px;
  padding: 9px 9px 8px 14px;
  background: ${theme.colors.backgroundGray1000};
  border: 1px solid ${theme.colors.backgroundGray900};
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
