import styled from "@emotion/styled"
import { ButtonTransparent } from "components/Button/Button"
import { theme } from "theme"

export const SToolbarButton = styled(ButtonTransparent)`
  position: relative;

  width: 40px;
  height: 40px;

  border-radius: 8px;

  background: transparent;

  transition: background ${theme.transitions.default};

  :hover {
    background: rgba(${theme.rgbColors.alpha0}, 0.06);
  }
`

export const SToolbarIcon = styled.div`
  color: ${theme.colors.brightBlue100};

  width: 20px;
  height: 20px;
`
