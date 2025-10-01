import {
  AssetLabel,
  AssetLabelProps,
  Flex,
  Skeleton,
} from "@galacticcouncil/ui/components"
import { FC, ReactNode } from "react"

import { TAssetData } from "@/api/assets"
import { Farm } from "@/api/farms"
import { AssetLogo } from "@/components/AssetLogo"
import { StablepoolBadge } from "@/modules/liquidity/components/StablepoolBadge"

import { AssetLabelFarms } from "./AssetLabelFarms"

export const AssetLabelFull = ({
  asset,
  size,
  withName = true,
  loading = false,
}: {
  asset?: TAssetData
  size?: AssetLabelProps["size"]
  withName?: boolean
  loading?: boolean
}) => {
  if (loading && !asset) {
    return (
      <AssetLabelFullContainer>
        <Skeleton circle width={24} height={24} />
        <AssetLabel
          symbol={""}
          name={withName ? "" : undefined}
          size={size}
          loading
        />
      </AssetLabelFullContainer>
    )
  }

  if (!asset) return null

  return (
    <AssetLabelFullContainer>
      {loading ? (
        <Skeleton circle width={24} height={24} />
      ) : (
        <AssetLogo id={asset.id} size={size} />
      )}
      <AssetLabel
        symbol={asset.symbol}
        name={withName ? asset.name : undefined}
        size={size}
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
  farms,
}: {
  iconIds: string[]
  symbol: string
  name?: string
  farms?: Farm[]
  size?: AssetLabelProps["size"]
}) => {
  const isFarms = farms && farms.length > 0

  return (
    <AssetLabelFullContainer>
      <AssetLogo id={iconIds} />
      {isFarms ? (
        <AssetLabelFarms farms={farms}>
          <AssetLabel symbol={symbol} name={name} size={size} />
        </AssetLabelFarms>
      ) : (
        <AssetLabel symbol={symbol} name={name} size={size} />
      )}
    </AssetLabelFullContainer>
  )
}

export const AssetLabelStablepool = ({
  asset,
  size,
  withName = true,
}: {
  asset: TAssetData
  size?: AssetLabelProps["size"]
  withName?: boolean
}) => {
  return (
    <AssetLabelFullContainer>
      <AssetLogo id={asset.id} size={size} />
      <AssetLabel
        symbol={asset.symbol}
        name={withName ? asset.name : undefined}
        size={size}
        badge={<StablepoolBadge />}
      />
    </AssetLabelFullContainer>
  )
}

const AssetLabelFullContainer: FC<{
  children: ReactNode
}> = ({ children }) => {
  return (
    <Flex gap={8} align="center" minWidth={0}>
      {children}
    </Flex>
  )
}
