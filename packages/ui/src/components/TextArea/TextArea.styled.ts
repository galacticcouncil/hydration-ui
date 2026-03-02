import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const STextAreaContainer = styled.label<{ error?: string }>(
  ({ error, theme }) => css`
    display: flex;
    flex-direction: column;
    gap: 14px;

    width: 100%;

    box-sizing: border-box;

    border-radius: ${theme.radii.xl};

    border: 1px solid
      ${error ? theme.accents.danger.secondary : theme.buttons.outlineDark.rest};

    background-color: ${theme.buttons.outlineDark.rest};

    padding: 14px;

    :focus,
    :focus-visible,
    :hover {
      outline: none;

      border-bottom: 1px solid
        ${error ? theme.accents.danger.secondary : theme.colors.darkBlue};
    }
  `,
)

export const STextArea = styled.textarea(
  ({ theme }) => css`
    resize: none;
    font-size: ${theme.fontSizes.p5};
    outline: none;

    border: none;
    background: transparent;

    color: ${theme.text.high};

    border-radius: ${theme.radii.base};

    width: 100%;
    min-height: 3.125rem;

    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    overflow-x: hidden;

    ::placeholder {
      font-family: ${theme.fontFamilies1.secondary};
      color: rgba(114, 131, 165, 0.6);
    }
  `,
)

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
