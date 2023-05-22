import styled from "@emotion/styled"
import { ButtonTransparent } from "components/Button/Button"
import { theme } from "theme"

export const SContainer = styled.form`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  &:not(:last-child) {
    border-bottom: 1px solid ${theme.colors.darkBlue401};
  }
`

export const SInput = styled.input`
  all: unset;
  color: ${theme.colors.white} !important;

  font-family: "ChakraPetch", sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 14px;
  width: min-content;

  &:focus {
    background-color: rgba(${theme.rgbColors.primaryA20}, 0.2);
  }
`

export const SButton = styled(ButtonTransparent)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${theme.colors.brightBlue300};
  font-weight: 400;
  font-size: 12px;
  transition: all 0.15s ease-in-out;
  &:hover {
    color: ${theme.colors.brightBlue100};
  }
`
