import { Amount } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"

type Props = {
  readonly assetId: string
  readonly total: string
}

export const AssetDetailTotal: FC<Props> = ({ assetId, total }) => {
  const { t } = useTranslation(["wallet", "common"])
  const [totalDisplayPrice] = useDisplayAssetPrice(assetId, total)

  return (
    <Amount
      label={t("myAssets.header.total")}
      value={t("common:number", {
        value: total,
      })}
      displayValue={totalDisplayPrice}
    />
  )
}
