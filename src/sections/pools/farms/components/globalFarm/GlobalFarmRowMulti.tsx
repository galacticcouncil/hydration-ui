import { getTotalAPR, TFarmAprData } from "api/farms"
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
  totalFee,
  fontSize = 14,
  iconSize = 14,
  withAprSuffix = false,
  className,
}: {
  farms: TFarmAprData[]
  totalFee?: BN
  assetFee?: BN
  fontSize?: number
  iconSize?: number
  withAprSuffix?: boolean
  className?: string
}) => {
  const { getAssetWithFallback } = useAssets()
  const { t } = useTranslation()

  const apr = totalFee ?? getTotalAPR(farms).plus(assetFee ?? 0)

  return (
    <div sx={{ flex: "row", gap: 4, align: "center" }} className={className}>
      <MultipleIcons
        size={iconSize}
        icons={farms.map((farm) => ({
          icon: <AssetLogo id={farm.rewardCurrency} />,
        }))}
      />
      <Text fs={fontSize} color="brightBlue200">
        {t(`value.percentage`, { value: apr })}
        {withAprSuffix ? ` ${t("apr")}` : ""}
      </Text>
      <InfoTooltip
        preventDefault
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
            {farms.length > 0 && (
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
            {farms.map(({ rewardCurrency, apr }) => {
              return (
                <div
                  key={rewardCurrency}
                  sx={{ flex: "row", gap: 4, justify: "space-between", mt: 6 }}
                >
                  <div sx={{ flex: "row", gap: 4, align: "center" }}>
                    <Icon size={14} icon={<AssetLogo id={rewardCurrency} />} />
                    <Text fs={12}>
                      {getAssetWithFallback(rewardCurrency).symbol}
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
