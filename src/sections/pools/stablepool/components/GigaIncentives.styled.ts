import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  justify-content: space-between;

  padding: 12px;

  background: rgba(${theme.rgbColors.primaryA06}, 0.06);
  border: 1px solid rgba(${theme.rgbColors.primaryA15Blue}, 0.35);
  border-radius: ${theme.borderRadius.default}px;
`

export const SIncentiveRow = styled.div`
  display: flex;
  gap: 4px;
  justify-content: space-between;
  margin-top: 6px;
`
