import styled from "@emotion/styled"
import { ArrowRight } from "lucide-react"

import { Icon } from "@/components/Icon"
import { css } from "@/utils"

export const SMenuItem = styled.div(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: 1fr 1fr;
    column-gap: 9px;
    align-items: center;
    justify-items: start;

    padding: ${theme.scales.paddings.m}px
      ${theme.containers.paddings.tertiary}px;

    text-decoration: none;

    &:focus {
      outline: none;
    }
  `,
)

export const SMenuItemIcon = styled(Icon)(
  ({ theme }) => css`
    grid-row: 1 / -1;
    color: ${theme.icons.soft};
  `,
)

export const SMenuItemLabel = styled.span(
  ({ theme }) => css`
    grid-row: 1;
    grid-column: 2;

    &:not(:has(+ ${SMenuItemDescription})) {
      grid-row: 1 / -1;
    }

    display: flex;
    align-items: center;
    gap: ${theme.scales.paddings.s}px;

    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 600;
    font-size: ${theme.paragraphSize.p3}px;
    line-height: ${theme.lineHeight.m}px;
    letter-spacing: 0%;
    text-align: center;

    color: ${theme.text.high};
  `,
)

export const SMenuItemDescription = styled.span(
  ({ theme }) => css`
    grid-row-start: 2;
    grid-column: 2;

    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 400;
    font-size: ${theme.paragraphSize.p5}px;
    line-height: ${theme.lineHeight.s}px;
    letter-spacing: 0%;

    color: ${theme.text.low};
  `,
)

export const SMenuItemAction = styled.div`
  grid-row: 1 / -1;
  grid-column: 3;
`

export const SMenuSelectionItem = styled(SMenuItem)(
  ({ theme }) => css`
    border-radius: ${theme.containers.cornerRadius.internalPrimary}px;
    cursor: pointer;

    &:hover,
    &:active {
      background-color: ${theme.buttons.secondary.low.primaryHover};
    }
  `,
)

export const SMenuSelectionItemArrow = styled(ArrowRight)(
  ({ theme }) => css`
    ${SMenuItemAction.__emotion_styles}

    width: 18px;
    height: 18px;

    color: ${theme.icons.onSurface};

    ${SMenuSelectionItem}:hover & {
      color: ${theme.icons.primary};
    }
  `,
)
