import styled from "@emotion/styled"
import { theme } from "theme"
import { SContainer as PoolContainer } from '../../pool/positions/LiquidityPosition.styled'

export const SContainer = styled(PoolContainer)`
  border-color: ${theme.colors.vibrantBlue300}!important;
  background: rgba(${theme.rgbColors.primaryA0}, 0.35);

  @media ${theme.viewport.gte.sm} {
    background: rgba(0, 7, 50, 0.7);
  }
`
