import {
  AssetLabel,
  AssetLabelProps,
  Flex,
  Skeleton,
} from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { FC, ReactNode } from "react"

import { TAssetData } from "@/api/assets"
import { AssetLogo } from "@/components/AssetLogo"
import { StablepoolBadge } from "@/modules/liquidity/components/StablepoolBadge"

export const AssetLabelFull = ({
  asset,
  size,
  withName = true,
  loading = false,
  variant = "horizontal",
}: {
  asset?: TAssetData
  size?: AssetLabelProps["variant"]
  withName?: boolean
  loading?: boolean
  variant?: AssetLabelFullVariant
}) => {
  if (loading && !asset) {
    return (
      <AssetLabelFullContainer variant={variant}>
        <Skeleton circle width={24} height={24} />
        <AssetLabel
          symbol={""}
          name={withName ? "" : undefined}
          variant={size}
          loading
        />
      </AssetLabelFullContainer>
    )
  }

  if (!asset) return null

  return (
    <AssetLabelFullContainer variant={variant}>
      {loading ? (
        <Skeleton circle width={24} height={24} />
      ) : (
        <AssetLogo id={asset.id} size={size === "primary" ? "large" : size} />
      )}
      <AssetLabel
        symbol={asset.symbol}
        name={withName ? asset.name : undefined}
        variant={size}
        loading={loading}
      />
    </AssetLabelFullContainer>
  )
}

export const AssetLabelXYK = ({
  iconIds,
  symbol,
  name,
  size,
}: {
  iconIds: string[]
  symbol: string
  name?: string
  size?: AssetLabelProps["variant"]
}) => {
  return (
    <AssetLabelFullContainer>
      <AssetLogo id={iconIds} />
      <AssetLabel symbol={symbol} name={name} variant={size} />
    </AssetLabelFullContainer>
  )
}

export const AssetLabelStablepool = ({
  asset,
  size,
  withName = true,
}: {
  asset: TAssetData
  size?: AssetLabelProps["variant"]
  withName?: boolean
}) => {
  return (
    <AssetLabelFullContainer>
      <AssetLogo id={asset.id} size={size === "primary" ? "large" : size} />
      <AssetLabel
        symbol={asset.symbol}
        name={withName ? asset.name : undefined}
        variant={size}
        badge={<StablepoolBadge />}
      />
    </AssetLabelFullContainer>
  )
}

type AssetLabelFullVariant = "horizontal" | "vertical"

export const AssetLabelFullContainer: FC<{
  children: ReactNode
  variant?: AssetLabelFullVariant
}> = ({ children, variant = "horizontal" }) => {
  return (
    <Flex
      gap={getTokenPx("scales.paddings.base")}
      {...(variant === "horizontal"
        ? {
            align: "center",
            minWidth: 0,
          }
        : {
            direction: "column",
          })}
      minWidth={0}
    >
      {children}
    </Flex>
  )
}
