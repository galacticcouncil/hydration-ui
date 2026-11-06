import { Children, cloneElement, isValidElement, useState } from "react"

import { TriangleAlert } from "@/assets/icons"
import { LogoProps, LogoSize, Tooltip } from "@/components"
import { LogoSkeleton } from "@/components/Logo/LogoSkeleton"

import {
  SAssetBadge,
  SAssetChainLogo,
  SAssetLogo,
  SBadgeSlot,
  SDecorationContainer,
} from "./AssetLogo.styled"

export type AssetLogoBadge = "red" | "yellow"
export type AssetLogoDecoration = "none" | "atoken"

export type AssetLogoProps = LogoProps & {
  chainSrc?: string
  badge?: AssetLogoBadge
  badgeTooltip?: string
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
  isLoading,
  decoration = "none",
  className,
}: AssetLogoProps) => {
  const [loadedSrc, setLoadedSrc] = useState<string>()

  if (isLoading) {
    return <LogoSkeleton size={size} />
  }

  return (
    <SDecorationContainer
      count={1}
      decoration={decoration}
      size={size}
      className={className}
    >
      <SAssetLogo
        src={src}
        alt={alt}
        size={size}
        data-loaded={(src && loadedSrc === src) || undefined}
        onLoad={() => setLoadedSrc(src)}
      />
      {chainSrc && <SAssetChainLogo size={size} src={chainSrc} />}
      {badge && <Badge badge={badge} tooltip={badgeTooltip} />}
    </SDecorationContainer>
  )
}

type MultipleAssetLogoWrapperProps = {
  size?: LogoSize
  children: React.ReactNode
  decoration?: AssetLogoDecoration
  /** Merge up to 4 logos into one circle, split into halves/quarters. */
  collapsed?: boolean
}

export const MultipleAssetLogoWrapper = ({
  size = "medium",
  children,
  decoration,
  collapsed,
}: MultipleAssetLogoWrapperProps) => {
  const items = Children.toArray(children)
  const logos = collapsed ? items.slice(0, 4) : items
  return (
    <SDecorationContainer
      size={size}
      count={collapsed ? 1 : logos.length}
      collapsed={collapsed ? logos.length : undefined}
      decoration={decoration}
    >
      {logos.map((child) => {
        if (isValidElement(child)) {
          return cloneElement(child, {
            ...(child.props ?? {}),
            ...{ size },
            ...(collapsed && { chainSrc: undefined }),
            // override child decor to "none" if decoration from parent is the same
            ...(typeof child.props === "object" &&
              child.props !== null &&
              "decoration" in child.props &&
              decoration === child.props.decoration && {
                decoration: "none",
              }),
          })
        }
      })}
    </SDecorationContainer>
  )
}

type BadgeProps = {
  badge: AssetLogoBadge
  tooltip?: string
}

const Badge: React.FC<BadgeProps> = ({ badge, tooltip }) => {
  const BadgeComp = (
    <SAssetBadge component={TriangleAlert} size="100%" type={badge} />
  )

  return (
    <SBadgeSlot>
      {tooltip ? <Tooltip text={tooltip}>{BadgeComp}</Tooltip> : BadgeComp}
    </SBadgeSlot>
  )
}
