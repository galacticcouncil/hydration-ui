import styled from "styled-components"
import { theme } from "theme"
import { Label } from "@radix-ui/react-label"

export const SLabelWrapper = styled(Label)<{ error?: string }>`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  padding: 7px 14px;

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
  font-weight: 700;

  font-size: 18px;
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
  font-size: 18px;
  line-height: 24px;
  text-align: right;
  font-weight: 700;

  padding: 0;

  ::placeholder {
    color: rgba(${theme.rgbColors.white}, 0.4);
  }

  :focus-visible {
    outline: none;
  }
`
