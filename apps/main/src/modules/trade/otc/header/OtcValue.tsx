import { ValueStats, ValueStatsValue } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { AssetPrice } from "@/components/AssetPrice"
import { useDisplayAssetStore } from "@/states/displayAsset"

type Props = {
  readonly label: string
  readonly price: number
}

export const OtcValue: FC<Props> = ({ label, price }) => {
  const assetId = useDisplayAssetStore((s) => s.id) ?? "10"

  return (
    <ValueStats
      label={label}
      customValue={
        <AssetPrice
          assetId={assetId}
          value={price}
          wrapper={<ValueStatsValue />}
        />
      }
    />
  )
}
