import styled from "@emotion/styled"
import { theme } from "theme"
import { SItem } from "./components/ProviderItem/ProviderItem.styled"

export const SHeader = styled(SItem)`
  background: rgba(${theme.rgbColors.primaryA06}, 0.06);
  color: ${theme.colors.basic700};

  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;

  padding: 6px var(--modal-content-padding);
`

export const SContainer = styled.div`
  margin: 0 calc(-1 * var(--modal-content-padding) + 1px);
  margin-top: 20px;
`
