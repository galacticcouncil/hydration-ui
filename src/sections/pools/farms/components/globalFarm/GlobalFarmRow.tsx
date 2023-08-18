import { useAsset } from "api/asset"
import { Farm, useFarmApr } from "api/farms"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

export const GlobalFarmRow = ({
  farm,
  isLastElement,
}: {
  farm: Farm
  isLastElement: boolean
}) => {
  const { t } = useTranslation()
  const { data: apr } = useFarmApr(farm)
  const { data: asset } = useAsset(apr?.assetId)

  if (!apr || !asset) return null

  return (
    <>
      <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
        <div sx={{ flex: "row", align: "center", gap: 6 }}>
          <Icon icon={<AssetLogo symbol={asset.symbol} />} size={24} />
          <Text>{asset.symbol}</Text>
        </div>

        <Text color="brightBlue200">
          {apr.minApr
            ? t("value.APR.range", { from: apr.minApr, to: apr.apr })
            : t("value.APR", { apr: apr.apr })}
        </Text>
      </div>
      {!isLastElement && <Separator />}
    </>
  )
}
