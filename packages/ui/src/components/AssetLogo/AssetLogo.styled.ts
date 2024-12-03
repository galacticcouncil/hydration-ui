import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { createVariants } from "@/utils"

import { Icon } from "../Icon"

type AssetLogoSize = "large" | "medium" | "small"
export type TBadge = "red" | "yellow"

export type AssetLogoProps = {
  src?: string
  chainSrc?: string
  assetId?: string
  size?: AssetLogoSize
  badge?: TBadge
  badgeTooltip?: string
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
