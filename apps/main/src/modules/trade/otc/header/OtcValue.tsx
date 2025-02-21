import { Flex } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"

import { AssetPrice } from "@/components"
import {
  SOtcPriceWrapper,
  SOtcValueLabel,
} from "@/modules/trade/otc/header/OtcHeader.styled"
import { useDisplayAssetStore } from "@/states/displayAsset"

type Props = {
  readonly label: string
  readonly price: number
}

export const OtcValue: FC<Props> = ({ label, price }) => {
  const assetId = useDisplayAssetStore((s) => s.id) ?? "10"

  return (
    <Flex
      direction={["row", "column"]}
      gap={getToken("scales.paddings.s")}
      justify={["space-between", null]}
    >
      <SOtcValueLabel>{label}</SOtcValueLabel>
      <AssetPrice
        assetId={assetId}
        value={price}
        wrapper={<SOtcPriceWrapper />}
      />
    </Flex>
  )
}
