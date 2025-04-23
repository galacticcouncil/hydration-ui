import styled from "@emotion/styled"
import { theme } from "theme"

export const SLoyaltyRewardsContainer = styled.div`
  padding: 20px 10px;
  margin: 20px calc(-1 * var(--modal-content-padding) + 1px) 0;

  background: rgba(${theme.rgbColors.darkBlue900}, 0.4);

  @media ${theme.viewport.gte.sm} {
    padding: 20px 40px;
  }
`
