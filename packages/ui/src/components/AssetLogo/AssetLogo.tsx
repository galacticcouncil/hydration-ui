import { Children, cloneElement, isValidElement } from "react"

import { PlaceholderAssetLogo, TriangleAlert } from "@/assets/icons"
import {  Skeleton, Tooltip } from "@/components"


import {
  LOGO_DIAMETER,
  SAssetBadge,
  SAssetLogo,
  SBadgeSlot,
  SChainLogo,
  SDecorationContainer,
  SPlaceholder,
} from "./AssetLogo.styled"

export type AssetLogoSize = "large" | "medium" | "small" | "extra-small"
export type TBadge = "red" | "yellow"
export type AssetLogoDecoration = "none" | "atoken"

export type AssetLogoProps = {
  src?: string
  chainSrc?: string
  alt?: string
  size?: AssetLogoSize
  badge?: TBadge
  badgeTooltip?: string
  className?: string
  decoration?: AssetLogoDecoration
  isLoading?: boolean
}

export const AssetLogo = ({
  src,
  size = "medium",
  alt,
  chainSrc,
  badge,
  badgeTooltip,
  className,
  isLoading,
  decoration = "none",
}: AssetLogoProps) => {
  if (!src)
    return (
      <SDecorationContainer count={1} size={size}>
        <SPlaceholder component={PlaceholderAssetLogo} size={size} />
      </SDecorationContainer>
    )

  if (isLoading) {
    const skeletonSize = LOGO_DIAMETER[size]

    return <Skeleton width={skeletonSize} height={skeletonSize} circle />
  }

  return (
    <SDecorationContainer count={1} decoration={decoration} size={size}>
      <SAssetLogo loading="lazy" src={src} alt={alt} size={size} />
      {chainSrc && <SChainLogo size={size} loading="lazy" src={chainSrc} />}
      {badge && <Badge badge={badge} tooltip={badgeTooltip} />}
    </SDecorationContainer>
  )
}

export const MultipleAssetLogoWrapper = ({
  size = "medium",
  children,
  decoration,
}: {
  size?: AssetLogoSize
  children: React.ReactNode
  decoration?: AssetLogoDecoration
}) => {
  return (
    <SDecorationContainer
      size={size}
      count={Children.count(children)}
      decoration={decoration}
    >
      {Children.map(children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child, {
            ...child.props,
            size,
            // override child decor to "none" if decoration from parent is the same
            ...(decoration === child.props.decoration && {
              decoration: "none",
            }),
          })
        }
      })}
    </SDecorationContainer>
  )
}

const Badge = ({ badge, tooltip }: { badge: TBadge; tooltip?: string }) => {
  const BadgeComp = (
    <SAssetBadge component={TriangleAlert} size="100%" type={badge} />
  )

  return (
    <SBadgeSlot>
      {tooltip ? <Tooltip text={tooltip}>{BadgeComp}</Tooltip> : BadgeComp}
    </SBadgeSlot>
  )
}
