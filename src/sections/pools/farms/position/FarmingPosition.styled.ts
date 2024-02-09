import styled from "@emotion/styled"
import { Separator } from "components/Separator/Separator"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;

  width: 100%;

  padding: 20px 16px;

  background-color: rgba(${theme.rgbColors.alpha0}, 0.06);

  border-radius: 4px;

  @media (${theme.viewport.gte.sm}) {
    padding: 20px 30px;
  }
`

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
