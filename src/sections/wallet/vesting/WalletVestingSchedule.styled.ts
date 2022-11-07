import styled from "@emotion/styled"
import { theme } from "../../../theme"

export const SSchedule = styled.div`
  background: linear-gradient(
      270deg,
      rgba(76, 243, 168, 0.12) 0.23%,
      rgba(76, 243, 168, 0) 67.62%,
      rgba(76, 243, 168, 0) 100%
    ),
    rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(${theme.rgbColors.white}, 0.06);
  margin-top: 26px;
`

export const SInner = styled.div`
  padding: 46px 74px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`
