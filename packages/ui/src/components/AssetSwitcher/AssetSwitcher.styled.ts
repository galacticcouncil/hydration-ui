import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { ButtonTransparent } from "@/components/Button"
import { Flex } from "@/components/Flex"
import { createStyles } from "@/utils"

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
    border-radius: ${theme.radii.full};
    padding: ${theme.space.base};
    background: ${theme.controls.dim.base};

    flex-shrink: 0;

    width: 2rem;
    height: 2rem;

    transition: ${theme.transitions.transform}, ${theme.transitions.colors};

    &:hover:not([disabled]) {
      transform: rotate(180deg);
      background: ${theme.controls.dim.hover};
    }

    &[disabled] {
      cursor: not-allowed;
    }
  `,
])

export const SValueContainer = styled(ButtonTransparent)(({ theme }) => [
  buttonStyles,
  css`
    border-radius: ${theme.radii.full};

    transition: ${theme.transitions.colors};

    padding: ${theme.space.xs} ${theme.sizes.s};

    height: ${theme.sizes.xl};

    flex: 1 0 auto;
  `,
])

export const SAssetSwitcher = styled(Flex)(
  ({ theme }) => css`
    align-items: center;

    & > div:first-of-type {
      flex-shrink: 0;
      width: ${theme.sizes.xl};
    }

    & > div:nth-of-type(2) {
      width: 100%;
    }

    & > div:last-of-type {
      flex-shrink: 0;
      width: ${theme.sizes.xl};
    }
  `,
)
