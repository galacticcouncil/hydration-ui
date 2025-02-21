import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { createVariants } from "@/utils"

import { Icon } from "../Icon"
import { AssetLogoSize } from "./AssetLogo"

const getSizeValue = (size: AssetLogoSize) => {
  if (size === "small") return 18

  if (size === "large") return 34

  return 24
}

const sizes = createVariants(() => ({
  small: css`
    width: 18px;
    height: 18px;
  `,
  medium: css`
    width: 24px;
    height: 24px;
  `,
  large: css`
    width: 34px;
    height: 34px;
  `,
}))

export const SAssetLogo = styled.img<{
  withChainLogo: boolean
  size: AssetLogoSize
}>(({ withChainLogo, size }) => [
  css`
    ${withChainLogo &&
    "mask: radial-gradient(112% 112% at 84% 16%, #0000 25%, #fff 25%);"}

    border-radius: 9999px;
  `,
  sizes(size),
])

export const SChainLogo = styled.img`
  display: flex;
  position: absolute;
  width: 50%;
  height: 50%;
  z-index: 1;
  right: -10%;
  top: -10%;
`

export const SAssetBadge = styled(Icon)<{ type: "red" | "yellow" }>(
  ({ theme, type }) => css`
    display: flex;

    filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.85));

    color: ${type === "red"
      ? theme.colors.utility.warningPrimary[500]
      : theme.colors.utility.warningSecondary[500]};
  `,
)

export const SPlaceholder = styled(Icon)<{ size: AssetLogoSize }>(({ size }) =>
  sizes(size),
)

export const SBadgeSlot = styled.div`
  display: flex;
  align-items: center;

  position: absolute;
  width: 50%;
  height: 50%;
  z-index: 1;
  right: -10%;
  bottom: -10%;
`

export const IconsWrapper = styled.div<{
  size: AssetLogoSize
}>(({ size }) => {
  const value = getSizeValue(size)

  return css`
    --logo-size: ${value}px;
    --logo-overlap: ${value * 0.3}px;
    --chain-size: ${value / 2}px;
    --chain-offset: ${value * 0.1}px;
    position: relative;

    display: flex;

    & > span {
      width: var(--logo-size);
      height: var(--logo-size);
      > svg {
        width: var(--logo-size);
        height: var(--logo-size);
      }
    }

    > :not(:first-of-type) {
      margin-left: calc(var(--logo-overlap) * -1);
    }

    &::before {
      content: "";
      position: absolute;
      inset: 0;

      pointer-events: none;

      padding: var(--chain-offset) var(--chain-offset) 0 0;
      margin-top: calc(var(--chain-offset) * -1);
      margin-right: calc(var(--chain-offset) * -1);

      --mask-space: 1px;
      --mask-gradient: calc(var(--chain-size) / 2),
        black calc(var(--chain-size) / 2 - 1px),
        transparent calc(var(--chain-size) / 2 - 1px),
        transparent calc(var(--chain-size) / 2 + var(--mask-space)),
        black calc(var(--chain-size) / 2 + var(--mask-space) + 0.5px);

      --mask-offset: calc(
        var(--logo-size) - var(--chain-size) / 2 + var(--chain-offset)
      );

      -webkit-mask-composite: destination-in;
      mask-composite: exclude;
    }
  `
})
