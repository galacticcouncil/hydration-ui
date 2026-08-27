import { css } from "@emotion/react"

import { styled } from "@/utils"

export const SEditableTextField = styled.div(
  () => css`
    position: relative;
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
  `,
)

export const SEditableTextInput = styled.input(
  ({ theme }) => css`
    all: unset;
    width: 100%;
    min-width: 0;
    cursor: text;
    color: ${theme.text.high};
  `,
)

export const SMeasure = styled.span(
  () => css`
    position: absolute;
    inset: 0 auto auto 0;
    visibility: hidden;
    white-space: pre;
    pointer-events: none;
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

export const SSaveHint = styled.span(
  ({ theme }) => css`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    gap: ${theme.space.xs};
    padding-left: ${theme.space.s};
    white-space: nowrap;
    pointer-events: none;
    font-family: ${theme.fontFamilies1.secondary};
    font-size: ${theme.fontSizes.p6};
    font-weight: 500;
    line-height: 1;
    color: ${theme.text.tint.quart};
  `,
)
