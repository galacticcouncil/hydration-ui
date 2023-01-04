import styled from "@emotion/styled"
import { Button } from "components/Button/Button"
import { theme } from "theme"

export const SContainer = styled.div`
  padding: 9px 9px 8px 14px;

  background: rgba(${theme.rgbColors.darkBlue900}, 0.6);

  cursor: pointer;

  flex-shrink: 0;

  border-radius: 4px;

  :active,
  :hover {
    background: rgba(${theme.rgbColors.brightBlue100}, 0.12);
  }

  :active {
    outline: 1px solid ${theme.colors.brightBlue300};
  }
`

export const SLoginButton = styled(Button)`
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;

  text-align: center;

  text-transform: uppercase;
  font-size: 16px;
  line-height: 16px;

  padding: 15px 23px;

  background: linear-gradient(
    360deg,
    #ff1e79 -32.73%,
    rgba(255, 103, 164, 0.32) 91.44%
  );

  box-shadow: 0px 10px 40px rgba(255, 103, 164, 0.31);

  border: 1px solid ${theme.colors.pink700};
`
