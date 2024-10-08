import { Farm, useFarmAprs, getMinAndMaxAPR } from "api/farms"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Icon } from "components/Icon/Icon"
import { useAssets } from "providers/assets"
import BN from "bignumber.js"
import { BN_0 } from "utils/constants"

export const GlobalFarmRowMulti = ({
  farms,
  assetFee = BN_0,
  fontSize = 14,
  iconSize = 14,
  withAprSuffix = false,
  className,
}: {
  farms: Farm[]
  assetFee?: BN
  fontSize?: number
  iconSize?: number
  withAprSuffix?: boolean
  className?: string
}) => {
  const { getAssetWithFallback } = useAssets()
  const { t } = useTranslation()
  const farmAprs = useFarmAprs(farms)

  if (!farmAprs.data) return null

  const { maxApr } = getMinAndMaxAPR(farmAprs)

  const totalMaxApr = maxApr.plus(assetFee ?? 0)

  return (
    <div sx={{ flex: "row", gap: 4, align: "center" }} className={className}>
      <MultipleIcons
        size={iconSize}
        icons={farmAprs.data.map((farm) => ({
          icon: <AssetLogo id={farm.assetId.toString()} />,
        }))}
      />
      <Text fs={fontSize} color="brightBlue200">
        {t(`value.percentage`, { value: totalMaxApr })}
        {withAprSuffix ? ` ${t("apr")}` : ""}
      </Text>
      <InfoTooltip
        text={
          <>
            <Text fs={12}>{t("liquidity.table.farms.apr.description")}</Text>
            {assetFee.gt(0) && (
              <div
                sx={{ flex: "row", gap: 4, justify: "space-between", mt: 6 }}
              >
                <Text fs={10} tTransform="uppercase" sx={{ opacity: 0.8 }}>
                  {t("liquidity.table.farms.apr.lpFee")}
                </Text>
                <Text fs={12} font="GeistSemiBold">
                  {t("value.percentage", { value: assetFee })}
                </Text>
              </div>
            )}
            {farmAprs.data.length > 0 && (
              <div
                sx={{
                  flex: "row",
                  gap: 4,
                  justify: "space-between",
                  mt: 6,
                  opacity: 0.8,
                }}
              >
                <Text fs={10} tTransform="uppercase">
                  {t("liquidity.table.farms.apr.rewards")}
                </Text>
                <Text fs={10} tTransform="uppercase">
                  {t("liquidity.table.farms.apr")}
                </Text>
              </div>
            )}
            {farmAprs.data.map(({ assetId, apr }) => {
              return (
                <div
                  key={assetId.toString()}
                  sx={{ flex: "row", gap: 4, justify: "space-between", mt: 6 }}
                >
                  <div sx={{ flex: "row", gap: 4, align: "center" }}>
                    <Icon
                      size={14}
                      icon={<AssetLogo id={assetId.toString()} />}
                    />
                    <Text fs={12}>
                      {getAssetWithFallback(assetId.toString()).symbol}
                    </Text>
                  </div>
                  <Text fs={12} font="GeistSemiBold">
                    {t("value.percentage", { value: apr })}
                  </Text>
                </div>
              )
            })}
          </>
        }
      />
    </div>
  )
}
