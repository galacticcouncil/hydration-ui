import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Button, NumberInput } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"
import { NumericFormat } from "react-number-format"

import { AssetLogo } from "@/components/AssetLogo"

export const SPriceInput = styled(NumberInput)(
  ({ theme }) => css`
    font-weight: 600;
    font-size: ${theme.fontSizes.p3};
    color: ${theme.text.high};
    flex: 1;
    min-width: 0;
    max-width: 100%;
    text-align: right;
    padding-right: 0;

    ${mq("lg")} {
      font-size: ${theme.fontSizes.p2};
    }
  `,
)

type PillTone = "neutral" | "positive" | "negative"

const toneStyles = (
  color: string,
  bg: string,
  borderColor: string,
  withHover: boolean,
) => css`
  color: ${color};
  background: ${bg};
  border-color: ${borderColor};

  ${SPillSeparator} {
    background: ${borderColor};
  }

  ${withHover &&
  css`
    &:hover {
      color: ${color};
      background: ${bg};
      filter: brightness(1.2);
    }
  `}
`

export const SCustomPill = styled.div<{
  isActive?: boolean
  tone?: PillTone
}>(
  ({ theme, isActive, tone = "neutral" }) => css`
    box-sizing: border-box;
    display: inline-flex;
    align-items: stretch;

    height: calc(1em + 2 * ${theme.space.xs} + 2 * ${theme.scales.border.base});

    border: ${theme.scales.border.base} solid;
    border-radius: ${theme.containers.cornerRadius.buttonsPrimary};

    font-family: ${theme.fontFamilies1.secondary};
    font-size: ${theme.fontSizes.p6};
    font-weight: 500;
    line-height: 1;

    transition: ${theme.transitions.colors};

    ${isActive
      ? css`
          color: ${theme.buttons.secondary.accent.onRest};
          background: ${theme.buttons.secondary.accent.rest};
          border-color: ${theme.buttons.secondary.accent.outline};

          ${SPillSeparator} {
            background: ${theme.buttons.secondary.accent.outline};
          }
        `
      : css`
          color: ${theme.text.medium};
          background: ${theme.buttons.secondary.low.rest};
          border-color: ${theme.buttons.secondary.low.borderRest};

          ${SPillSeparator} {
            background: ${theme.buttons.secondary.low.borderRest};
          }

          &:hover {
            color: ${theme.text.high};
            background: ${theme.buttons.secondary.low.hover};
          }
        `}

    ${tone === "positive" &&
    toneStyles(
      theme.accents.success.emphasis,
      theme.accents.success.dim,
      theme.accents.success.emphasis,
      !isActive,
    )}

    ${tone === "negative" &&
    toneStyles(
      theme.accents.danger.secondary,
      theme.accents.danger.dimBg,
      isActive ? theme.accents.danger.emphasis : theme.accents.danger.secondary,
      !isActive,
    )}
  `,
)

export const SPillActions = styled.div`
  display: inline-flex;
  align-items: stretch;
  flex-shrink: 0;
  align-self: stretch;
  svg {
    width: 0.675rem;
    height: 0.675rem;
  }
`

export const SPillTrigger = styled.button(
  ({ theme }) => css`
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    align-self: center;
    min-width: 0;
    color: inherit;
    font: inherit;
    line-height: inherit;

    padding-inline: ${theme.sizes["3xs"]};

    &:focus-visible {
      border-radius: ${theme.radii.full};
      outline: ${theme.space.xs} solid ${theme.controls.outline.active};
      outline-offset: ${theme.scales.border.base};
    }
  `,
)

export const SPercentSuffix = styled.span(
  ({ theme }) => css`
    align-self: center;
    padding-right: ${theme.sizes["3xs"]};
  `,
)

export const SPillSeparator = styled.span(
  ({ theme }) => css`
    flex-shrink: 0;
    align-self: stretch;
    width: ${theme.scales.border.base};
    width: 1px;
    background: ${theme.controls.outline.base};
  `,
)

export const SPillSliceButton = styled.button(
  ({ theme }) => css`
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
    display: flex;

    align-items: center;
    align-self: stretch;
    justify-content: center;
    line-height: 0;
    padding-inline: ${theme.sizes["3xs"]};
    border-radius: 0 ${theme.containers.cornerRadius.buttonsPrimary}
      ${theme.containers.cornerRadius.buttonsPrimary} 0;
    color: inherit;
    background: transparent;
    transition: ${theme.transitions.colors};

    &:focus-visible {
      outline: ${theme.space.xs} solid ${theme.controls.outline.active};
      outline-offset: calc(-1 * ${theme.scales.border.base});
    }
  `,
)

export const SPillInlineInput = styled(NumericFormat)(
  ({ theme }) => css`
    all: unset;
    width: ${theme.sizes["2xl"]};
    align-self: center;
    height: 1em;
    flex-shrink: 0;
    text-align: right;
    font: inherit;

    padding-inline: ${theme.sizes["3xs"]};

    &::placeholder {
      color: ${theme.text.low};
      opacity: 1;
    }

    &:focus::placeholder {
      color: transparent;
    }
  `,
)

export const SInlineAssetLogo = styled(AssetLogo)`
  display: inline-flex;
  margin-inline: 0.1em;
`

export const SInvertDenominationButton = styled(Button)`
  box-sizing: border-box;
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  min-width: 1.75rem;
  padding: 0;

  svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  ${mq("lg")} {
    width: auto;
    min-width: unset;
    width: 2.3rem;
    height: 2.3rem;

    svg {
      width: 1rem;
      height: 1rem;
    }
  }
`

export const SMarketPrice = styled.span`
  text-decoration: underline dotted;
  text-underline-offset: 0.15em;
`

export const SMarketButton = styled.button(
  ({ theme }) => css`
    all: unset;
    cursor: pointer;
    font-size: ${theme.fontSizes.p5};
    font-weight: 500;
    line-height: 1.2;
    color: ${theme.text.medium};
    transition: ${theme.transitions.colors};

    &:hover {
      color: ${theme.text.high};
    }
  `,
)
