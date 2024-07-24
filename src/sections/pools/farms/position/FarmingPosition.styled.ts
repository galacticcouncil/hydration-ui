import styled from "@emotion/styled"
import { Separator } from "components/Separator/Separator"
import { theme } from "theme"

export const SSeparator = styled(Separator)`
  background: rgba(${theme.rgbColors.white}, 0.06);
`

export const SValueContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
  align-self: center;
  justify-content: space-between;

  width: 100%;
`
