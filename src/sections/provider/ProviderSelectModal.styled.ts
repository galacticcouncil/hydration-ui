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

export const SContainer = styled.div<{ isLoading: boolean }>`
  margin: 0 calc(-1 * var(--modal-content-padding) + 1px);
  margin-top: 20px;

  ${({ isLoading }) =>
    isLoading &&
    `
      pointer-events: none;
      opacity: 0.5;
  `}
`

export const SSwitchContainer = styled.div`
  padding: 18px 12px;
  margin: 0 -12px;

  border-top: 1px solid ${theme.colors.darkBlue401};
  border-bottom: 1px solid ${theme.colors.darkBlue401};

  @media ${theme.viewport.gte.sm} {
    padding: 18px 24px;
    margin: 0 -24px;
  }
`
