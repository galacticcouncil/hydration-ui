import styled from "@emotion/styled"
import { theme } from "theme"

export const SCustomInput = styled.input`
  background: none;
  border: none;

  color: ${theme.colors.white};

  font-size: 24px;
  font-weight: 600;
  line-height: 1;
  text-align: right;
  outline: none;

  border-radius: ${theme.borderRadius.default}px;

  transition: background ${theme.transitions.default};

  &:hover:not(:focus) {
    color: ${theme.colors.brightBlue300};
    cursor: pointer;
  }
`
