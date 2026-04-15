import isPropValid from "@emotion/is-prop-valid"
import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Box, Flex } from "@galacticcouncil/ui/components"

export const SDenominationPill = styled(Flex)(
  ({ theme }) => css`
    align-items: center;
    gap: ${theme.space.s};

    padding-block: 8px;
    padding-inline: 14px;
    border-radius: ${theme.radii.xxl};
    border: 1px solid ${theme.details.separators};

    font-weight: 500;
    font-size: ${theme.fontSizes.p4};
    color: ${theme.text.high};
    white-space: nowrap;

    cursor: pointer;
    user-select: none;
    flex-shrink: 0;
    background: transparent;

    svg {
      color: ${theme.icons.onContainer};
    }

    &:hover {
      background: ${theme.buttons.secondary.low.rest};
    }
  `,
)

// Matches SMicroButton (MAX button) sizing: p6 font, xs/base padding, uppercase.
export type PriceOptionTone = "positive" | "negative"

export const SPriceOption = styled(Box, {
  shouldForwardProp: (prop) =>
    isPropValid(prop) && prop !== "active" && prop !== "tone",
})<{ active?: boolean; tone?: PriceOptionTone }>(
  ({ theme, active, tone }) => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;

    padding: ${theme.space.xs} ${theme.space.base};
    border-radius: ${theme.containers.cornerRadius.buttonsPrimary};
    border: 1px solid ${theme.buttons.secondary.low.borderRest};
    background: ${theme.buttons.secondary.low.rest};

    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 500;
    font-size: ${theme.fontSizes.p6};
    line-height: 1;
    text-transform: uppercase;
    white-space: nowrap;

    color: ${theme.text.medium};

    cursor: pointer;
    user-select: none;

    transition: ${theme.transitions.colors};

    ${active &&
    css`
      border-color: ${theme.buttons.secondary.accent.outline};
      background: ${theme.buttons.secondary.accent.rest};
      color: ${theme.buttons.secondary.accent.onRest};
    `}

    ${tone === "positive" &&
    css`
      color: ${theme.details.values.positive};
      border-color: ${theme.details.values.positive}66;
      background: ${theme.details.values.positive}1a;
    `}

    ${tone === "negative" &&
    css`
      color: ${theme.details.values.negative};
      border-color: ${theme.details.values.negative}66;
      background: ${theme.details.values.negative}1a;
    `}

    &:hover {
      color: ${theme.text.high};
      border-color: ${theme.buttons.secondary.accent.outline};
      background: ${theme.buttons.secondary.accent.hover};
    }
  `,
)

export const SCustomPill = styled(Box, {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== "active",
})<{ active?: boolean }>(
  ({ theme, active }) => css`
    display: inline-flex;
    align-items: center;
    gap: 2px;

    color: ${active ? theme.text.high : theme.text.low};
    padding-block: ${theme.space.base};
    padding-inline: ${theme.space.l};
    border-radius: ${theme.radii.xxl};
    font-weight: 500;
    font-size: ${theme.fontSizes.p3};
    line-height: ${theme.lineHeights.m};
    cursor: pointer;
    user-select: none;

    ${active
      ? css`
          background: ${theme.buttons.secondary.low.rest};
        `
      : ""}

    &:hover {
      color: ${theme.text.high};
      background: ${theme.buttons.secondary.low.rest};
    }
  `,
)

export const SPctBadge = styled("span", {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== "tone",
})<{ tone?: PriceOptionTone }>(
  ({ theme, tone }) => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;

    padding: ${theme.space.xs} ${theme.space.base};
    border-radius: ${theme.containers.cornerRadius.buttonsPrimary};
    border: 1px solid ${theme.buttons.secondary.low.borderRest};
    background: ${theme.buttons.secondary.low.rest};

    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 500;
    font-size: ${theme.fontSizes.p6};
    line-height: 1;
    text-transform: uppercase;
    white-space: nowrap;

    color: ${theme.text.medium};

    user-select: none;

    ${tone === "positive" &&
    css`
      color: ${theme.details.values.positive};
      border-color: ${theme.details.values.positive}66;
      background: ${theme.details.values.positive}1a;
    `}

    ${tone === "negative" &&
    css`
      color: ${theme.details.values.negative};
      border-color: ${theme.details.values.negative}66;
      background: ${theme.details.values.negative}1a;
    `}
  `,
)

export const SCustomPctInput = styled.input(
  () => css`
    width: 2ch;
    background: none;
    border: none;
    outline: none;
    color: inherit;
    font: inherit;
    text-align: right;
    padding: 0;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }
    -moz-appearance: textfield;

    &::placeholder {
      color: inherit;
      opacity: 0.6;
    }
  `,
)
