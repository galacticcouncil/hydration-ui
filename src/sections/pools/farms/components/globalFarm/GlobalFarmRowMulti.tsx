import { getTotalAPR, TFarmAprData } from "api/farms"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Icon } from "components/Icon/Icon"
import { useAssets } from "providers/assets"
import BN from "bignumber.js"

export const APY = ({
  farms,
  totalFee,
  fontSize = 14,
  iconSize = 14,
  withAprSuffix = false,
  className,
  lpFeeOmnipool,
  lpFeeStablepool,
}: {
  farms?: TFarmAprData[]
  totalFee?: BN
  fontSize?: number
  iconSize?: number
  withAprSuffix?: boolean
  className?: string
  lpFeeOmnipool?: string
  lpFeeStablepool?: string
}) => {
  const { getAssetWithFallback } = useAssets()
  const { t } = useTranslation()

  const apr =
    totalFee && !totalFee.isNaN()
      ? totalFee
      : getTotalAPR(farms ?? [])
          .plus(lpFeeOmnipool ?? 0)
          .plus(lpFeeStablepool ?? 0)

  const isFarms = farms && !!farms.length
  const isVisibleTooltip = isFarms || (lpFeeOmnipool && lpFeeStablepool)

  return (
    <div sx={{ flex: "row", gap: 4, align: "center" }} className={className}>
      {isFarms && (
        <MultipleIcons
          size={iconSize}
          icons={farms.map((farm) => ({
            icon: <AssetLogo id={farm.rewardCurrency} />,
          }))}
        />
      )}
      <Text fs={fontSize} color={isFarms ? "brightBlue200" : undefined}>
        {t(`value.percentage`, { value: apr })}
        {withAprSuffix ? ` ${t("apr")}` : ""}
      </Text>

      {isVisibleTooltip && (
        <InfoTooltip
          preventDefault
          text={
            <>
              <Text fs={12}>{t("liquidity.table.farms.apr.description")}</Text>
              {lpFeeOmnipool && (
                <div
                  sx={{ flex: "row", gap: 4, justify: "space-between", mt: 6 }}
                >
                  <Text fs={10} tTransform="uppercase" sx={{ opacity: 0.8 }}>
                    {t("liquidity.table.farms.apr.lpFeeOmnipool")}
                  </Text>
                  <Text fs={12} font="GeistSemiBold">
                    {t("value.percentage", { value: BN(lpFeeOmnipool) })}
                  </Text>
                </div>
              )}
              {lpFeeStablepool && (
                <div
                  sx={{ flex: "row", gap: 4, justify: "space-between", mt: 6 }}
                >
                  <Text fs={10} tTransform="uppercase" sx={{ opacity: 0.8 }}>
                    {t("liquidity.table.farms.apr.lpFeeStablepool")}
                  </Text>
                  <Text fs={12} font="GeistSemiBold">
                    {t("value.percentage", { value: BN(lpFeeStablepool) })}
                  </Text>
                </div>
              )}
              {isFarms && (
                <>
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
                  {farms.map(({ rewardCurrency, apr }) => {
                    return (
                      <div
                        key={rewardCurrency}
                        sx={{
                          flex: "row",
                          gap: 4,
                          justify: "space-between",
                          mt: 6,
                        }}
                      >
                        <div sx={{ flex: "row", gap: 4, align: "center" }}>
                          <Icon
                            size={14}
                            icon={<AssetLogo id={rewardCurrency} />}
                          />
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
              )}
            </>
          }
        />
      )}
    </div>
  )
}
