import { TradeDcaOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { FC } from "react"
import { useFormContext } from "react-hook-form"

import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { DcaFormValues } from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { useSwitchAssets } from "@/modules/trade/swap/sections/DCA/useSwitchAssets"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly order: TradeDcaOrder | undefined
}

export const DcaAssetSwitcher: FC<Props> = ({ order }) => {
  const { watch } = useFormContext<DcaFormValues>()
  const [sellAsset, buyAsset, sellAmount] = watch([
    "sellAsset",
    "buyAsset",
    "sellAmount",
  ])

  const switchAssets = useSwitchAssets()

  return (
    <AssetSwitcher
      assetInId={sellAsset?.id ?? ""}
      assetOutId={buyAsset?.id ?? ""}
      onSwitchAssets={() => switchAssets.mutate()}
      priceIn={sellAmount}
      priceOut={
        buyAsset ? scaleHuman(order?.amountOut || "0", buyAsset.decimals) : "0"
      }
    />
  )
}
