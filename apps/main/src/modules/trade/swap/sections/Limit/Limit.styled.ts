import isPropValid from "@emotion/is-prop-valid"
import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Box, Flex } from "@galacticcouncil/ui/components"

export const SDenominationPill = styled(Flex)(
  ({ theme }) => css`
    align-items: center;
    gap: ${theme.space.s};

    padding-block: ${theme.space.base};
    padding-inline: ${theme.space.l};
    border-radius: ${theme.radii.xxl};

    font-weight: 500;
    font-size: ${theme.fontSizes.p5};
    color: ${theme.text.high};
    white-space: nowrap;

    cursor: pointer;
    user-select: none;
    flex-shrink: 0;

    margin-left: calc(-1 * ${theme.containers.paddings.tertiary});

    svg {
      color: ${theme.icons.primary};
    }

    &:hover {
      background: ${theme.buttons.secondary.low.rest};
    }
  `,
)

export const SPriceOption = styled(Box, {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== "active",
})<{ active?: boolean }>(
  ({ theme, active }) => css`
    color: ${active ? theme.text.high : theme.text.low};

    padding-block: ${theme.space.base};
    padding-inline: ${theme.space.l};
    border-radius: ${theme.radii.xxl};

    font-weight: 500;
    font-size: ${theme.fontSizes.p3};
    line-height: ${theme.lineHeights.m};
    text-decoration: none;

    cursor: pointer;
    user-select: none;

    ${active &&
    css`
      background: ${theme.buttons.secondary.low.rest};
    `}

    &:hover {
      color: ${theme.text.high};
      background: ${theme.buttons.secondary.low.rest};
    }
  `,
)
