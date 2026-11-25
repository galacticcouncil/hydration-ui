import { Children, cloneElement, isValidElement, useState } from "react"

import { LogoProps, LogoSize } from "@/components"
import { LogoSkeleton } from "@/components/Logo/LogoSkeleton"
import { Skeleton } from "@/components/Skeleton"

import {
  SAssetChainLogo,
  SAssetLogo,
  SDecorationContainer,
  SSideChainSkeleton,
  SSideChainSkeletonChain,
} from "./AssetLogo.styled"

export type AssetLogoDecoration = "none" | "atoken"
export type AssetLogoChainPosition = "corner" | "side"

export type AssetLogoProps = LogoProps & {
  chainSrc?: string
  /**
   * "side" puts a smaller chain logo left of the asset, cut out by a gap.
   */
  chainPosition?: AssetLogoChainPosition
  decoration?: AssetLogoDecoration
  isLoading?: boolean
}

export const AssetLogo = ({
  src,
  size = "medium",
  alt,
  chainSrc,
  chainPosition = "corner",
  isLoading,
  decoration = "none",
  className,
}: AssetLogoProps) => {
  const [loadedSrc, setLoadedSrc] = useState<string>()
  const [failedChainSrc, setFailedChainSrc] = useState<string>()

  if (isLoading) {
    return chainPosition === "side" ? (
      <SSideChainSkeleton>
        <SSideChainSkeletonChain size={size}>
          <Skeleton circle sx={{ size: "100%", display: "flex" }} />
        </SSideChainSkeletonChain>
        <LogoSkeleton size={size} />
      </SSideChainSkeleton>
    ) : (
      <LogoSkeleton size={size} />
    )
  }

  const showChain = !!chainSrc && chainSrc !== failedChainSrc

  return (
    <SDecorationContainer
      count={1}
      decoration={decoration}
      size={size}
      chainPosition={showChain ? chainPosition : "corner"}
      className={className}
    >
      <SAssetLogo
        src={src}
        alt={alt}
        size={size}
        data-loaded={(src && loadedSrc === src) || undefined}
        onLoad={() => setLoadedSrc(src)}
      />
      {showChain && (
        <SAssetChainLogo
          size={size}
          src={chainSrc}
          onError={() => setFailedChainSrc(chainSrc)}
        />
      )}
    </SDecorationContainer>
  )
}

type MultipleAssetLogoWrapperProps = {
  size?: LogoSize
  children: React.ReactNode
  decoration?: AssetLogoDecoration
  /** one chain logo beside the whole stack, always in "side" position */
  chainSrc?: string
  /** Merge up to 4 logos into one circle, split into halves/quarters. */
  collapsed?: boolean
}

export const MultipleAssetLogoWrapper = ({
  size = "medium",
  children,
  decoration,
  chainSrc,
  collapsed,
}: MultipleAssetLogoWrapperProps) => {
  const items = Children.toArray(children)
  const logos = collapsed ? items.slice(0, 4) : items
  const [failedChainSrc, setFailedChainSrc] = useState<string>()
  const showChain = !!chainSrc && chainSrc !== failedChainSrc

  return (
    <SDecorationContainer
      size={size}
      count={collapsed ? 1 : logos.length}
      collapsed={collapsed ? logos.length : undefined}
      decoration={decoration}
      chainPosition={showChain ? "side" : "corner"}
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
      {showChain && (
        <SAssetChainLogo
          size={size}
          src={chainSrc}
          onError={() => setFailedChainSrc(chainSrc)}
        />
      )}
    </SDecorationContainer>
  )
}
