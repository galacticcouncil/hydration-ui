import styled from "@emotion/styled"
import { theme } from "../../theme"

export const SAssetsModalHeader = styled.div<{
  shadowed?: boolean
}>`
  display: flex;
  justify-content: space-between;
  background: ${({ shadowed }) =>
    shadowed ? `rgba(${theme.rgbColors.white}, .03)` : "transparent"};
  border: 1px solid ${theme.colors.backgroundGray800};
  border-left: none;
  border-right: none;
  padding: 5px 30px;
  margin: 0 -30px;
`
