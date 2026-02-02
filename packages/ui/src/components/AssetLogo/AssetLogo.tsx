import { Children, cloneElement, isValidElement } from "react"

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
      <SAssetLogo src={src} alt={alt} size={size} />
      {chainSrc && <SAssetChainLogo size={size} src={chainSrc} />}
      {badge && <Badge badge={badge} tooltip={badgeTooltip} />}
    </SDecorationContainer>
  )
}

type MultipleAssetLogoWrapperProps = {
  size?: LogoSize
  children: React.ReactNode
  decoration?: AssetLogoDecoration
}

export const MultipleAssetLogoWrapper = ({
  size = "medium",
  children,
  decoration,
}: MultipleAssetLogoWrapperProps) => {
  return (
    <SDecorationContainer
      size={size}
      count={Children.count(children)}
      decoration={decoration}
    >
      {Children.map(children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child, {
            ...(child.props ?? {}),
            ...{ size },
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
