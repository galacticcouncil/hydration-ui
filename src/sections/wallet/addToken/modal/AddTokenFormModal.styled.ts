import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { theme } from "theme"

const formControlStyles = css`
  padding: 18px 12px;
  background: rgba(158, 167, 186, 0.06);
  color: ${theme.colors.white};

  font-size: 14px;

  border: 1px solid rgba(${theme.rgbColors.white}, 0.12);
  border-radius: ${theme.borderRadius.default}px;

  ::placeholder {
    color: rgba(${theme.rgbColors.white}, 0.4);
  }

  :active,
  :focus {
    outline: none;
    border-color: ${theme.colors.brightBlue300};
  }
`

export const SInput = styled.input`
  ${formControlStyles}
`

export const STextarea = styled.textarea`
  resize: none;
  ${formControlStyles}
`

export const SLabel = styled.label`
  display: flex;
  position: relative;

  color: ${theme.colors.basic500};

  text-transform: uppercase;

  & > span {
    display: block;
    position: absolute;
    top: 0;
    left: 0;

    font-weight: 500;

    padding: 18px 12px;
  }

  & > textarea,
  & > input {
    width: 100%;
    padding-top: 42px;
  }
`
