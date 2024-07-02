import styled from "@emotion/styled"
import { theme } from "theme"
import { Button } from "components/Button/Button"
import { SPositionContainer } from "sections/pools/pool/myPositions/MyPositions.styled"

export const SContainer = styled(SPositionContainer)`
  border-color: ${theme.colors.vibrantBlue300}!important;
  background: rgba(0, 7, 50, 0.7) !important;
`

export const SOmnipoolButton = styled(Button)`
  width: 100%;

  background: rgb(${theme.rgbColors.vibrantBlue200});
  border: none;
  color: ${theme.colors.white};

  &:not(:disabled) {
    :hover {
      background: rgb(${theme.rgbColors.vibrantBlue300});
      border: none;
    }
    :active {
      background: rgb(${theme.rgbColors.vibrantBlue400});
      border: none;
    }
  }
`
