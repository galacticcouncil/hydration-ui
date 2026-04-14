import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { ButtonTransparent, Flex } from "@galacticcouncil/ui/components"
import { createStyles } from "@galacticcouncil/ui/utils"

const buttonStyles = createStyles(
  (theme) => css`
    background: ${theme.controls.dim.base};

    &:hover:not([disabled]) {
      background: ${theme.controls.dim.hover};
    }

    &[disabled] {
      cursor: not-allowed;
    }
  `,
)

export const SSwitchContainer = styled(ButtonTransparent, {
  shouldForwardProp: (prop) => prop !== "rotation",
})<{ rotation?: number }>(({ theme, rotation = 0 }) => [
  buttonStyles,
  css`
    border-radius: ${theme.radii.full};
    padding: 8px;

    transition: ${theme.transitions.transform};
    transform: rotate(${rotation}deg);
  `,
])

export const SPriceContainer = styled(ButtonTransparent)(({ theme }) => [
  buttonStyles,
  css`
    border-radius: ${theme.containers.cornerRadius.containersPrimary};

    transition: ${theme.transitions.colors};

    padding: 2px 14px;

    height: 28px;

    flex: 1 0 auto;
  `,
])

export const SAssetSwitcher = styled(Flex)`
  & > div:first-of-type {
    flex-shrink: 0;
    width: 32px;
  }

  & > div:nth-of-type(2) {
    width: 100%;
  }

  & > div:last-of-type {
    flex-shrink: 0;
    width: 32px;
  }

  /* When the price pill is hidden, the row only contains
     [separator][switch-button][separator]. Match the Market swap layout:
     short stub on the left of the button, long separator extending to the
     right edge. */
  &[data-no-price="true"] > div:first-of-type {
    width: 32px;
    flex: 0 0 32px;
  }

  &[data-no-price="true"] > div:last-of-type {
    width: auto;
    flex: 1 1 auto;
  }
`
