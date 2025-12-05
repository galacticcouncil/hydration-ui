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

export const SSwitchContainer = styled(ButtonTransparent)(({ theme }) => [
  buttonStyles,
  css`
    border-radius: ${theme.radii.full}px;
    padding: 8px;

    transition: ${theme.transitions.transform};

    &:hover:not([disabled]) {
      transform: rotate(180deg);
    }
  `,
])

export const SPriceContainer = styled(ButtonTransparent)(({ theme }) => [
  buttonStyles,
  css`
    border-radius: ${theme.containers.cornerRadius.containersPrimary}px;

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
`
