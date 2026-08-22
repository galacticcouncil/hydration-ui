import { Amount } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly assetId: string
  readonly total: string
}

export const AssetDetailTotal: FC<Props> = ({ assetId, total }) => {
  const { t } = useTranslation(["wallet", "common"])
  const { getAssetWithFallback } = useAssets()
  const [totalDisplayPrice] = useDisplayAssetPrice(assetId, total)

  return (
    <Amount
      variant="primary"
      label={t("myAssets.header.total")}
      value={t("common:currency", {
        value: total,
        symbol: getAssetWithFallback(assetId).symbol,
      })}
      displayValue={totalDisplayPrice}
    />
  )
}
