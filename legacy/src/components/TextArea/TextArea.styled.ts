import styled from "@emotion/styled"
import { theme } from "theme"

export const STextAreaContainer = styled.label<{ error?: string }>`
  display: flex;
  flex-direction: column;
  gap: 14px;

  width: 100%;

  box-sizing: border-box;

  border-radius: 4px;
  border: none;
  border-bottom: 1px solid
    ${({ error }) => (error ? theme.colors.error : theme.colors.darkBlue400)};

  background: rgba(218, 255, 238, 0.06);

  padding: 14px;

  :focus,
  :focus-visible,
  :hover {
    outline: none;

    border-bottom: 1px solid
      ${({ error }) =>
        error ? theme.colors.error : theme.colors.brightBlue300};
  }
`

export const STextArea = styled.textarea`
  resize: none;
  font-size: 14px;
  outline: none;

  border: none;
  background: transparent;

  color: ${theme.colors.white};

  border-radius: 4px;

  width: 100%;
  min-height: 50px;

  ::placeholder {
    font-family: Geist;
    color: rgba(114, 131, 165, 0.6);
  }
`

export const STextAreaBar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  width: 100%;

  & > svg {
    margin-left: auto;
  }
`
