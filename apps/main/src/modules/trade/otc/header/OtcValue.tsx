import { HeaderInfo, HeaderInfoValue } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { AssetPrice } from "@/components"
import { useDisplayAssetStore } from "@/states/displayAsset"

type Props = {
  readonly label: string
  readonly price: number
}

export const OtcValue: FC<Props> = ({ label, price }) => {
  const assetId = useDisplayAssetStore((s) => s.id) ?? "10"

  return (
    <HeaderInfo
      label={label}
      customValue={
        <AssetPrice
          assetId={assetId}
          value={price}
          wrapper={<HeaderInfoValue />}
        />
      }
    />
  )
}
