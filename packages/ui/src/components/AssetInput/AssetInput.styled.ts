import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { Button } from "../Button"
import { Input } from "../Input"

export const SAssetButton = styled.button<{ isError: boolean }>(
  ({ theme, isError }) => css`
    all: unset;
    box-sizing: border-box;

    display: flex;
    gap: 6px;
    align-items: center;

    padding: 4px 8px 4px 4px;
    height: 38px;

    border-radius: 30px;
    border: 1px solid
      ${isError
        ? theme.accents.danger.dimBg
        : theme.buttons.secondary.low.borderRest};

    cursor: pointer;

    &:hover {
      border-color: ${theme.buttons.secondary.low.hover};
      background: ${theme.buttons.secondary.low.primaryHover};
    }
  `,
)

export const SAssetButtonEmpty = styled(Button)`
  padding: 4px 8px 4px 12px;
  height: 38px;
  box-sizing: border-box;
`

export const SAssetInput = styled(Input)<{ isError: boolean }>(
  ({ isError, theme }) => css`
    text-align: right;
    font-size: 16px;
    height: auto;
    padding-right: 0px;

    color: ${isError ? theme.accents.danger.secondary : "inherit"};
  `,
)

export const SMaxButton = styled.button(
  ({ theme }) => css`
    all: unset;

    cursor: pointer;

    padding: 0 8px;

    font-size: 10px;
    font-weight: 500;
    line-height: 140%;
    text-transform: uppercase;
    color: ${theme.text.medium};

    border-radius: ${theme.containers.cornerRadius.buttonsPrimary}px;
    background: ${theme.buttons.secondary.low.rest};

    &:not(:disabled):hover {
      color: ${theme.text.high};
      background: ${theme.buttons.outlineDark.hover};
    }

    &:disabled {
      cursor: not-allowed;

      opacity: 0.2;
    }
  `,
)
