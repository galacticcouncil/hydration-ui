import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:not(:last-child) {
    padding-bottom: 12px;
    margin-bottom: 12px;
    border-bottom: 1px solid rgba(${theme.rgbColors.white}, 0.05);
  }
`
