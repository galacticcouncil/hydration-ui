import { useAsset } from "api/asset"
import { Farm, useFarmApr } from "api/farms"
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
      <div sx={{ flex: "row", justify: "space-between" }}>
        <Text>{asset.symbol}</Text>
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
