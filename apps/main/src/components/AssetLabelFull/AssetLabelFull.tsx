import {
  AssetLabel,
  AssetLabelProps,
  Flex,
} from "@galacticcouncil/ui/components"
import { FC, ReactNode } from "react"

import { TAssetData } from "@/api/assets"
import { Logo } from "@/components/Logo"

export const AssetLabelFull = ({
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

const AssetLabelFullContainer: FC<{
  children: ReactNode
}> = ({ children }) => {
  return <Flex sx={{ gap: 8, alignItems: "center" }}>{children}</Flex>
}
