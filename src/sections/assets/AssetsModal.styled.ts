import styled from "@emotion/styled"
import { theme } from "theme"

export const SAssetsModalHeader = styled.div<{
  shadowed?: boolean
}>`
  display: flex;
  justify-content: space-between;
  background: ${({ shadowed }) =>
    shadowed
      ? `rgba(${theme.rgbColors.white}, .03)`
      : `rgba(${theme.rgbColors.alpha0}, 0.06)`};
  border-left: none;
  border-right: none;
  padding: 5px 30px;
`
