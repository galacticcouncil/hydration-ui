import { css } from "@emotion/react"

import { styled } from "@/utils"

export const SEditableTextInput = styled.input(
  ({ theme }) => css`
    all: unset;
    flex: 1;
    min-width: 0;
    width: 100%;
    cursor: text;
    color: ${theme.text.high};
  `,
)

export const SEditButton = styled.button(
  ({ theme }) => css`
    all: unset;
    display: inline-flex;
    cursor: pointer;
    align-items: center;
    flex-shrink: 0;
    line-height: 1;
    color: ${theme.text.medium};

    &:hover {
      color: ${theme.text.high};
    }
  `,
)
