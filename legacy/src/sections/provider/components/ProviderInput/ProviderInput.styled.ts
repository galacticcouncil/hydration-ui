import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.label<{ error?: boolean }>`
  padding: 12px;
  margin-top: 10px;

  display: flex;
  align-items: center;
  gap: 8px;

  transition: ${theme.transitions.default};

  background: rgba(${theme.rgbColors.alpha0}, 0.06);
  border-radius: ${theme.borderRadius.default}px;
  border-bottom: 1px solid
    ${(p) => (p.error ? theme.colors.error : theme.colors.darkBlue400)};

  :focus,
  :focus-visible,
  :focus-within,
  :hover {
    outline: none;

    cursor: text;

    background: rgba(${theme.rgbColors.primaryA15}, 0.12);

    border-bottom: 1px solid
      ${({ error }) =>
        error ? theme.colors.error : theme.colors.brightBlue600};
  }

  button {
    padding-top: 8px;
    padding-bottom: 8px;
  }
`

export const SInput = styled.input`
  all: unset;
  color: ${theme.colors.white};

  font-size: 12px;

  width: 100%;

  transition: ${theme.transitions.default};

  ::placeholder {
    color: rgba(${theme.rgbColors.white}, 0.4);
    font-size: 12px;
  }

  :focus-visible {
    outline: none;
  }
`
