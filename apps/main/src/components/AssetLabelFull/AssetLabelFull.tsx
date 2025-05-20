import {
  AssetLabel,
  AssetLabelProps,
  Flex,
  Skeleton,
} from "@galacticcouncil/ui/components"
import { FC, ReactNode } from "react"

import { TAssetData } from "@/api/assets"
import { Logo } from "@/components/Logo"
import { StablepoolBadge } from "@/modules/liquidity/components/StablepoolBadge"

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
        <Logo id={asset.id} size={size} />
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
}: {
  iconIds: string[]
  symbol: string
  name?: string
  size?: AssetLabelProps["size"]
}) => {
  return (
    <AssetLabelFullContainer>
      <Logo id={iconIds} />
      <AssetLabel symbol={symbol} name={name} size={size} />
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
      <Logo id={asset.id} size={size} />
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
  return <Flex sx={{ gap: 8, alignItems: "center" }}>{children}</Flex>
}
