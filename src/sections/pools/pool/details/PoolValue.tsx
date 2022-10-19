import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { useTotalInPool } from "../Pool.utils"
import { PoolBase } from "@galacticcouncil/sdk"
import { useAssetMeta } from "api/assetMeta"
import { usePoolDetailsTradeVolume } from "./PoolDetails.utils"
import BN from "bignumber.js"

type Props = { pool: PoolBase }

const PoolDetailTradeVolume = (props: { assetId: string; sum: BN }) => {
  const { t } = useTranslation()
  const { data: assetMeta } = useAssetMeta(props.assetId)
  return (
    <Text lh={22} color="white" fs={18} sx={{ display: "block" }}>
      {t("value", {
        value: assetMeta?.data && props.sum,
        fixedPointScale: assetMeta?.data?.decimals,
        decimalPlaces: 2,
        numberSuffix: ` ${assetMeta?.data?.symbol.toHuman()}`,
      })}
    </Text>
  )
}

const PoolValue = ({ pool }: Props) => {
  const { t } = useTranslation()
  const { data } = useTotalInPool({ pool })
  const volume = usePoolDetailsTradeVolume(pool.address)

  return (
    <div sx={{ flex: "row", justify: "space-between", align: "end", mb: 12 }}>
      <div>
        <Text fs={14} color="neutralGray400" lh={26}>
          {t("pools.pool.poolDetails.total")}
        </Text>
        <Text lh={22} color="white" fs={18}>
          {t("value.usd", { amount: data })}
        </Text>
      </div>
      <div sx={{ flex: "column", width: ["auto", 120] }}>
        <Text fs={14} color="neutralGray400" lh={26}>
          {t("pools.pool.poolDetails.24hours")}
        </Text>
        {volume.length > 0 ? (
          volume.map(({ assetId, sum }) => (
            <PoolDetailTradeVolume key={assetId} assetId={assetId} sum={sum} />
          ))
        ) : (
          <Text lh={22} color="white">
            {t("value.na")}
          </Text>
        )}
      </div>
    </div>
  )
}

export default PoolValue
