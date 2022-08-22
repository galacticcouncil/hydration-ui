import styled from "styled-components"
import { theme } from "theme"

export const FarmsWrapper = styled.div`
  max-width: 392px;
  flex-grow: 1;
  margin-left: 70px;
`

export const JoinedFarms = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  align-items: center;
  margin-bottom: 11px;
`

export const AvailableFarms = styled.div`
  background: rgba(${theme.rgbColors.white}, 0.06);
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  align-items: center;
`
