import styled from "@emotion/styled"
import { theme } from "theme"

export const SLabelWrapper = styled.label<{ error?: string }>`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;

  padding: 7px 14px;

  min-height: 54px;
`

export const SInputWrapper = styled.span`
  display: flex;
  position: relative;

  align-items: center;
  gap: 4px;

  width: 100%;
`

export const SUnit = styled.span`
  width: auto;
  color: ${theme.colors.white};
  font-weight: 500;

  font-size: 16px;
  line-height: 24px;
  white-space: nowrap;
`

export const SDollars = styled.span`
  font-size: 11px;
  line-height: 15.4px;
  color: ${theme.colors.basic400};
  font-weight: 400;
`

export const SInput = styled.input`
  width: 100%;

  background: none;
  border: none;

  color: ${theme.colors.white};
  font-size: 18px;
  line-height: 24px;
  text-align: right;
  font-weight: 600;
  font-family: "ChakraPetchSemiBold";

  padding: 0;

  ::placeholder {
    color: rgba(${theme.rgbColors.white}, 0.4);
  }

  :focus-visible {
    outline: none;
  }
`

export const SErrorMessage = styled.p`
  color: ${theme.colors.error};
  font-size: 12px;
  line-height: 16px;
  margin-top: 2px;
`
