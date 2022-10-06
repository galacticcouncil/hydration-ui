import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: 8px;

  padding: 20px;

  background-color: rgba(${theme.rgbColors.white}, 0.08);
  border: 1px solid rgba(${theme.rgbColors.white}, 0.12);
  border-radius: 14px;
`

export const SIcon = styled.div`
  height: 22px;

  display: flex;
  align-items: center;
`
