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

    transition: ${theme.transitions.colors};

    padding: 4px;
    height: 38px;
    min-width: fit-content;

    border-radius: 30px;
    border: 1px solid
      ${isError
        ? theme.accents.danger.dimBg
        : theme.buttons.secondary.low.borderRest};

    &:not(:disabled) {
      cursor: pointer;
    }

    &:hover:not(:disabled) {
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

export const SAssetInput = styled(Input)`
  text-align: right;
  font-size: 16px;
  height: auto;
  padding-right: 0px;
`
