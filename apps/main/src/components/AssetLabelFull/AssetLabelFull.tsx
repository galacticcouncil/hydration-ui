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
}: {
  asset: TAssetData
  size?: AssetLabelProps["size"]
}) => {
  return (
    <AssetLabelFullContainer>
      <Logo id={asset.id} />
      <AssetLabel symbol={asset.symbol} name={asset.name} size={size} />
    </AssetLabelFullContainer>
  )
}

export const AssetLabelFullMobile = ({
  asset,
  size,
}: {
  asset: TAssetData
  size?: AssetLabelProps["size"]
}) => {
  return (
    <AssetLabelFullContainer>
      <Logo id={asset.id} />
      <AssetLabel symbol={asset.symbol} size={size} />
    </AssetLabelFullContainer>
  )
}

const AssetLabelFullContainer: FC<{
  children: ReactNode
}> = ({ children }) => {
  return <Flex sx={{ gap: 8, alignItems: "center" }}>{children}</Flex>
}
