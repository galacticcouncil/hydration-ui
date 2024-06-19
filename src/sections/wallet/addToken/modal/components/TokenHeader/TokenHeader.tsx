import { AssetId } from "@galacticcouncil/ui"
import { createComponent } from "@lit-labs/react"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import * as React from "react"
import { TExternalAsset } from "sections/wallet/addToken/AddToken.utils"

export const UigcAssetId = createComponent({
  tagName: "uigc-asset-id",
  elementClass: AssetId,
  react: React,
})

export type TokenHeaderProps = {
  asset: TExternalAsset
}

export const TokenHeader: React.FC<TokenHeaderProps> = ({ asset }) => {
  return (
    <div sx={{ flex: "row", gap: 10 }}>
      <Icon
        sx={{ flexShrink: 0 }}
        size={46}
        icon={<UigcAssetId symbol={asset.symbol} />}
      />
      <div>
        <Text fs={22} lh={28} font="GeistMono">
          {asset.symbol}
        </Text>
        <Text fs={13} color="darkBlue200">
          {asset.name}
        </Text>
      </div>
    </div>
  )
}
