import { ValueStats, ValueStatsValue } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { AssetPrice } from "@/components/AssetPrice"
import { USDT_ASSET_ID } from "@/utils/consts"

type Props = {
  readonly label: string
  readonly price: number
  readonly isLoading: boolean
}

export const OtcValue: FC<Props> = ({ label, price, isLoading }) => {
  return (
    <ValueStats
      label={label}
      isLoading={isLoading}
      customValue={
        <AssetPrice
          assetId={USDT_ASSET_ID}
          value={price}
          wrapper={<ValueStatsValue />}
        />
      }
    />
  )
}
