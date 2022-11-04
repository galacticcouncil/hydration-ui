import { DualAssetIcons } from "components/DualAssetIcons/DualAssetIcons"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { PoolBase } from "@galacticcouncil/sdk"
import { PoolDetailsTradeFee } from "./PoolDetailsTradeFee"

export const PoolDetails = (props: {
  pool: PoolBase
  onClick?: () => void
}) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "column" }}>
      <div sx={{ flex: "row", justify: "space-between" }}>
        <div>
          <Text fs={14} lh={26} fw={400} color="neutralGray400">
            {t("pools.pool.title", { type: props.pool.type })}
          </Text>
          <div sx={{ flex: "row", align: "center" }}>
            <DualAssetIcons
              firstIcon={{ icon: getAssetLogo(props.pool.tokens[0].symbol) }}
              secondIcon={{ icon: getAssetLogo(props.pool.tokens[1].symbol) }}
            />
            <div sx={{ flex: "column", gap: 1 }}>
              <Text fw={700} color="white">
                {props.pool.tokens[0].symbol}/{props.pool.tokens[1].symbol}
              </Text>
              <Text fs={12} lh={14} color="neutralGray500">
                Token/Token {/*TODO*/}
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
