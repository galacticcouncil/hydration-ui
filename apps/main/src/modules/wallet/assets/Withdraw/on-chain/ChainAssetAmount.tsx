import { Amount } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components"

type Props = {
  readonly assetId: string
  readonly balance: string
}

export const ChainAssetAmount: FC<Props> = ({ assetId, balance }) => {
  const { t } = useTranslation()
  const [displayAssetPrice] = useDisplayAssetPrice(assetId, balance)

  return (
    <Amount
      sx={{ textAlign: "right" }}
      value={t("number", { value: balance })}
      displayValue={displayAssetPrice}
    />
  )
}
