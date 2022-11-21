import { DualAssetIcons } from "components/DualAssetIcons/DualAssetIcons"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { getAssetLogo, getAssetName } from "components/AssetIcon/AssetIcon"
import { PoolBase } from "@galacticcouncil/sdk"
import { PoolDetailsTradeFee } from "./PoolDetailsTradeFee"

export const PoolDetails = (props: {
  pool: PoolBase
  onClick?: () => void
}) => {
  const { t } = useTranslation()
  const [{ symbol: assetA }, { symbol: assetB }] = props.pool.tokens

  return (
    <div sx={{ flex: "column" }}>
      <div sx={{ flex: "row", justify: "space-between" }}>
        <div>
          <Text fs={14} lh={26} fw={400} color="neutralGray400">
            {t("pools.pool.title", { type: props.pool.type })}
          </Text>
          <div sx={{ flex: "row", align: "center" }}>
            <DualAssetIcons
              firstIcon={{ icon: getAssetLogo(assetA) }}
              secondIcon={{ icon: getAssetLogo(assetB) }}
            />
            <div sx={{ flex: "column", gap: 1 }}>
              <Text fw={700} color="white">
                {assetA}/{assetB}
              </Text>
              <Text fs={12} lh={14} color="neutralGray500">
                {getAssetName(assetA)}/{getAssetName(assetB)}
              </Text>
            </div>
          </div>
        </div>
        <PoolDetailsTradeFee pool={props.pool} />
      </div>
      <Separator sx={{ mt: [18, 34] }} />
    </div>
  )
}
