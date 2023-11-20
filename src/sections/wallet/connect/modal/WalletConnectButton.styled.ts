import styled from "@emotion/styled"
import { Button } from "components/Button/Button"
import { theme } from "theme"

export const SContainer = styled.div`
  padding: 6px 6px 6px 10px;

  background: rgba(${theme.rgbColors.black}, 0.2);

  cursor: pointer;

  flex-shrink: 0;

  border-radius: 4px;

  transition: ${theme.transitions.slow};

  outline: 1px solid transparent;

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
  font-size: 14px;
  line-height: 14px;

  padding: 12px 16px;
  height: 40px;

  white-space: nowrap;

  background: linear-gradient(
    360deg,
    #ff1e79 -32.73%,
    rgba(255, 103, 164, 0.32) 91.44%
  );

  box-shadow: 0px 10px 40px rgba(255, 103, 164, 0.31);

  border: 1px solid ${theme.colors.pink700};
`

export const SAvatarCointainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const SAvatarMask = styled.div`
  display: flex;

  mask: radial-gradient(106% 106% at 106% 50%, transparent 53%, black 53%);
`
