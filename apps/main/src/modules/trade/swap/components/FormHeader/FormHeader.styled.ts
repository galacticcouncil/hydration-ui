import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Box, Flex, Icon } from "@galacticcouncil/ui/components"

export const SHeaderTab = styled(Box)<{ readonly disabled?: boolean }>(
  ({ theme, disabled }) => css`
    color: ${theme.text.low};

    padding-block: 10px;
    padding-inline: 12px;
    border-radius: 30px;

    font-weight: 500;
    font-size: 14px;
    line-height: 18px;
    text-decoration: none;

    cursor: pointer;

    ${disabled &&
    css`
      pointer-events: none;
    `}

    &[data-status="active"] {
      color: ${theme.text.high};
    }

    &:hover {
      color: ${theme.text.high};
      background: ${theme.buttons.secondary.low.rest};
    }
  `,
)

export const SFormHeader = styled(Flex)(
  ({ theme }) => css`
    padding: ${theme.containers.paddings.secondary}px 0;
  `,
)

export const SSettingsIcon = styled(Icon)(
  ({ theme }) => css`
    cursor: pointer;

    color: ${theme.icons.onContainer};

    transition: ${theme.transitions.colors};

    &:hover {
      color: ${theme.icons.onSurfaceHover};
    }
  `,
)
