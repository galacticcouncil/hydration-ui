import { useAsset } from "api/asset"
import { Farm, useFarmApr } from "api/farms"
import { useTranslation } from "react-i18next"
import { FarmIncentive } from "../../../components/FarmIncentive"

export const GlobalFarmRow = ({ farm }: { farm: Farm }) => {
  const { t } = useTranslation()
  const { data: apr } = useFarmApr(farm)
  const { data: asset } = useAsset(apr?.assetId)

  if (!apr || !asset) return null

  return (
    <FarmIncentive
      symbol={asset.symbol}
      apr={
        apr.minApr
          ? t("value.APR.range", { from: apr.minApr, to: apr.apr })
          : t("value.APR", { apr: apr.apr })
      }
    />
  )
}
