import styled from "@emotion/styled"
import { theme } from "theme"

export const SLabelWrapper = styled.label<{ error?: string }>`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;

  padding: 7px 14px;

  min-height: 54px;

  background: ${theme.colors.backgroundGray800};
  border-radius: 9px;
  border: 1px solid
    ${(p) => (p.error ? theme.colors.error : theme.colors.backgroundGray600)};

  :focus-within,
  :hover {
    background: ${theme.colors.backgroundGray700};
  }

  :focus-within {
    border-color: ${theme.colors.primary300};
  }
`

export const SInputWrapper = styled.span`
  display: flex;
  position: relative;

  align-items: center;
  gap: 4px;
`

export const SUnit = styled.span`
  width: auto;
  color: ${theme.colors.white};
  font-weight: 500;

  font-size: 16px;
  line-height: 24px;
`

export const SDollars = styled.span`
  font-size: 10px;
  line-height: 14px;
  color: ${theme.colors.neutralGray400};
  font-weight: 600;
`

export const SInput = styled.input`
  width: 100%;

  background: none;
  border: none;

  color: ${theme.colors.white};
  font-size: 16px;
  line-height: 24px;
  text-align: right;
  font-weight: 500;

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
  text-transform: capitalize;
`
