import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { Input } from "@/components/Input"
import { pxToRem } from "@/utils"

const MAIN_ROW_HEIGHT = pxToRem(38)
const AMOUNT_ROW_HEIGHT = pxToRem(24)
const SUBLINE_ROW_HEIGHT = pxToRem(14)

const truncate = css`
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

export const SRoot = styled.div<{ isAmountHidden: boolean }>(
  ({ theme, isAmountHidden }) => css`
    display: grid;
    column-gap: ${theme.space.m};
    min-width: 0;

    grid-template-columns: ${isAmountHidden
      ? "minmax(0, 1fr)"
      : "auto minmax(0, 1fr)"};
    grid-template-rows: ${isAmountHidden
      ? `auto ${MAIN_ROW_HEIGHT} ${SUBLINE_ROW_HEIGHT}`
      : `auto ${AMOUNT_ROW_HEIGHT} ${SUBLINE_ROW_HEIGHT}`};
    grid-template-areas: ${isAmountHidden
      ? `"header" "asset" "sub"`
      : `"header header" "asset amount" "asset sub"`};
  `,
)

export const SHeader = styled.div(
  ({ theme }) => css`
    grid-area: header;

    display: flex;
    align-items: center;
    gap: ${theme.space.s};
    min-width: 0;
    min-height: ${pxToRem(20)};
    margin-bottom: ${theme.space.m};
  `,
)

export const SLabel = styled.div(
  ({ theme }) => css`
    ${truncate};
    flex: 1 1 0;

    font-size: ${theme.fontSizes.p5};
    line-height: 1.2;
    color: ${theme.text.medium};
  `,
)

export const SBalance = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.space.s};
    flex: 0 1 auto;
    min-width: 0;
    margin-left: auto;
  `,
)

export const SBalanceText = styled.div(
  ({ theme }) => css`
    ${truncate};

    font-size: ${theme.fontSizes.p5};
    font-weight: 500;
    line-height: 1.2;
    font-variant-numeric: tabular-nums;
    color: ${theme.text.low};
  `,
)

export const SAssetButton = styled.button<{
  isError: boolean
  isEmpty: boolean
}>(
  ({ theme, isError, isEmpty }) => css`
    grid-area: asset;
    align-self: center;
    justify-self: start;

    display: inline-flex;
    align-items: center;
    gap: ${theme.space.base};
    flex-shrink: 0;
    box-sizing: border-box;
    height: ${MAIN_ROW_HEIGHT};
    margin: 0;
    padding-block: 0;
    padding-inline: ${isEmpty ? theme.space.l : theme.space.s} ${theme.space.m};

    font: inherit;
    font-size: ${theme.fontSizes.p3};
    font-weight: 600;
    white-space: nowrap;
    color: ${isEmpty ? theme.buttons.primary.medium.onButton : theme.text.high};

    background: ${isEmpty ? theme.buttons.primary.medium.rest : "none"};
    border-radius: ${theme.radii.full};
    border: 1px solid
      ${isError
        ? theme.accents.danger.dimBg
        : isEmpty
          ? "transparent"
          : theme.buttons.secondary.low.borderRest};

    transition: ${theme.transitions.colors};

    &:enabled {
      cursor: pointer;
    }

    &:enabled:hover {
      border-color: ${isEmpty
        ? "transparent"
        : theme.buttons.secondary.low.hover};
      background: ${isEmpty
        ? theme.buttons.primary.medium.hover
        : theme.buttons.secondary.low.primaryHover};
    }

    &:disabled {
      cursor: default;
    }

    & > svg {
      margin-right: -${theme.space.base};
      color: ${isEmpty ? "currentColor" : theme.icons.onContainer};
    }
  `,
)

export const SAmount = styled.div(
  ({ theme }) => css`
    grid-area: amount;
    position: relative;
    display: flex;
    min-width: 0;

    & input {
      text-align: right;
      font-size: ${theme.fontSizes.p2};
      font-variant-numeric: tabular-nums;
    }

    & input[aria-busy="true"] {
      opacity: 0;
    }
  `,
)

export const SAmountInput = styled(Input)`
  width: 100%;
  height: 100%;
  min-width: 0;
  padding: 0;
`

export const SOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  pointer-events: none;
`

export const SSubline = styled.div<{ isError: boolean }>(
  ({ theme, isError }) => css`
    ${truncate};
    grid-area: sub;
    align-self: center;

    font-size: ${theme.fontSizes.p6};
    line-height: 1;
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: ${isError ? theme.accents.danger.secondary : theme.text.low};
  `,
)
