import styled from "@emotion/styled"
import { Separator } from "components/Separator/Separator"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  padding: 15px 30px;

  background-color: rgba(${theme.rgbColors.alpha0}, 0.06);

  border-radius: 4px;
`

export const SSeparator = styled(Separator)`
  background: rgba(${theme.rgbColors.white}, 0.06);
`

export const SValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-self: center;
`
