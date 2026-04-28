import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { Button } from "../Button"
import { Input } from "../Input"

export const SAssetButton = styled.button<{ isError: boolean }>(
  ({ theme, isError }) => css`
    all: unset;
    box-sizing: border-box;

    display: flex;
    gap: ${theme.space.s};
    align-items: center;

    height: 2rem;

    transition: ${theme.transitions.colors};

    padding: ${theme.space.s};
    padding-right: ${theme.space.m};
    min-width: fit-content;

    border-radius: ${theme.radii.full};
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

export const SAssetButtonEmpty = styled(Button)(
  ({ theme }) => css`
    padding-block: ${theme.space.s};
    padding-inline: ${theme.space.l};
    height: 2rem;
    box-sizing: border-box;
  `,
)

export const SAssetInput = styled(Input)(
  ({ theme }) => css`
    text-align: right;
    font-size: ${theme.fontSizes.p2};
    height: auto;
    width: 100%;
    padding: 0;
  `,
)
