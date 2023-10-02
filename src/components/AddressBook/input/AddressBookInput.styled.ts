import styled from "@emotion/styled"
import IconSearch from "assets/icons/IconSearch.svg?react"
import { ButtonTransparent } from "components/Button/Button"
import { theme } from "theme"

export const SContainer = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-column-gap: 14px;

  padding: 14px;

  background-color: rgba(${theme.rgbColors.primaryA0}, 0.06);
  border-bottom: 1px solid ${theme.colors.darkBlue400};
  border-radius: 2px;
`

export const SIcon = styled(IconSearch)`
  color: ${theme.colors.darkBlue300};
`

export const SInput = styled.input`
  all: unset;

  color: ${theme.colors.white} !important;
  font-family: "ChakraPetch", sans-serif;
  font-size: 12px;
  font-weight: 400;
`

export const SButton = styled(ButtonTransparent)`
  padding: 4px 10px;

  background: rgba(37, 203, 255, 0.2);
  border: 1px solid ${theme.colors.brightBlue600};
  border-radius: 4px;

  color: ${theme.colors.white};
  font-size: 12px;
  line-height: 16px;

  transition: all 0.15s ease-in-out;

  &:hover {
    background-color: rgba(37, 203, 255, 0.3);
  }
`
