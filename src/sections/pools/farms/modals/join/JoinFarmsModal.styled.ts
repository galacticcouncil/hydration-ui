import styled from "@emotion/styled"
import { theme } from "theme"

export const SJoinFarmContainer = styled.div`
  display: flex;
  flex-direction: column;

  background: rgba(${theme.rgbColors.darkBlue900}, 0.4);

  margin: 16px calc(-1 * var(--modal-content-padding))
    calc(-1 * var(--modal-content-padding));
  padding: 0 var(--modal-content-padding) var(--modal-content-padding);
`
