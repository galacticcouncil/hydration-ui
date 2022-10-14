import { DualAssetIcons } from "components/DualAssetIcons/DualAssetIcons"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { FC } from "react"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { PoolBase } from "@galacticcouncil/sdk"
import { getTradeFee, useTotalInPool } from "sections/pools/pool/Pool.utils"
import BN from "bignumber.js"
import { useAssetMeta } from "api/assetMeta"
import { usePoolDetailsTradeVolume } from "./PoolDetails.utils"
import { theme } from "theme"

type Props = { pool: PoolBase }

const PoolDetailTradeVolume = (props: { assetId: string; sum: BN }) => {
  const { t } = useTranslation("translation")
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

export const PoolDetails: FC<Props> = ({ pool }) => {
  const { t } = useTranslation()
  const total = useTotalInPool({ pool })

  const volume = usePoolDetailsTradeVolume(pool.address)

  return (
    <div sx={{ flex: "column", width: 380 }}>
      <div sx={{ flex: "row", justify: "space-between", mb: 32 }}>
        <div>
          <Text fs={14} lh={26} fw={400} color="neutralGray400">
            {t("pools.pool.title", { type: pool.type })}
          </Text>
          <div sx={{ flex: "row", align: "center" }}>
            <DualAssetIcons
              firstIcon={{ icon: getAssetLogo(pool.tokens[0].symbol) }}
              secondIcon={{ icon: getAssetLogo(pool.tokens[1].symbol) }}
            />
            <div sx={{ flex: "column", gap: 1 }}>
              <Text fw={700} color="white">
                {pool.tokens[0].symbol}/{pool.tokens[1].symbol}
              </Text>
              <Text fs={12} lh={14} color="neutralGray500">
                Token/Token {/*TODO*/}
              </Text>
            </div>
          </div>
        </div>
        <div
          sx={{ flex: "column", width: 120, align: "start" }}
          css={{ alignSelf: "end" }}
        >
          <Text fs={14} fw={400} color="neutralGray400" lh={26}>
            {t("pools.pool.poolDetails.fee")}
          </Text>
          <Text lh={22} color="white">
            {t("value.percentage", { value: getTradeFee(pool.tradeFee) })}
          </Text>
        </div>
      </div>
      <Separator
        sx={{ mb: 32 }}
        css={{ background: `rgba(${theme.rgbColors.white}, 0.05)` }}
      />
      <div sx={{ flex: "row", justify: "space-between" }}>
        <div>
          <Text fs={14} color="neutralGray400" lh={26} fw={400}>
            {t("pools.pool.poolDetails.total")}
          </Text>
          <Text lh={22} color="white" fs={18}>
            {t("value.usd", { amount: total.data })}
          </Text>
        </div>
        <div sx={{ flex: "column", width: 120, align: "start" }}>
          <Text fs={14} color="neutralGray400" lh={26} fw={400}>
            {t("pools.pool.poolDetails.24hours")}
          </Text>

          {volume.length > 0 ? (
            volume.map(({ assetId, sum }) => (
              <PoolDetailTradeVolume
                key={assetId}
                assetId={assetId}
                sum={sum}
              />
            ))
          ) : (
            <Text lh={22} color="white">
              {t("value.na")}
            </Text>
          )}
        </div>
      </div>
    </div>
  )
}
