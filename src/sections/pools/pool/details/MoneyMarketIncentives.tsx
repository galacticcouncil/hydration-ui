import BN from "bignumber.js"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Text } from "components/Typography/Text/Text"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { SContainer } from "sections/pools/farms/components/detailsCard/FarmDetailsCard.styled"
import { TStablepool } from "sections/pools/PoolsPage.utils"
import { BN_0 } from "utils/constants"
import { IncentiveRow } from "sections/pools/stablepool/components/GigaIncentives"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { getAssetIdFromAddress } from "utils/evm"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { ExternalApyType } from "api/borrow"
import i18n from "i18n/i18n"

export const getApyLabel = (apyType?: ExternalApyType, isSupply?: boolean) => {
  if (apyType === "stake") {
    return i18n.t("stakeApy")
  }

  if (apyType === "nativeYield") {
    return i18n.t("nativeYieldApy")
  }

  if (isSupply) {
    return i18n.t("supplyApy")
  } else {
    return i18n.t("borrowApy")
  }
}

export const MoneyMarketIncentives = ({ pool }: { pool: TStablepool }) => {
  const { t } = useTranslation()

  const { moneyMarketApy, lpFeeOmnipool, lpFeeStablepool } = pool

  if (!moneyMarketApy) return null

  const validIncentives = moneyMarketApy.incentives.filter(({ incentiveAPR }) =>
    BN(incentiveAPR).gt(0),
  )
  const totalApr = validIncentives
    .reduce((acc, incentive) => acc.plus(incentive.incentiveAPR), BN_0)
    .times(100)

  const totalApy = moneyMarketApy.underlyingAssetsApyData
    .reduce((acc, asset) => acc.plus(asset.supplyApy), BN_0)
    .plus(lpFeeOmnipool ?? 0)
    .plus(lpFeeStablepool ?? 0)

  return (
    <>
      {totalApr.gt(0) && (
        <AvailableIncentive
          label={t("liquidity.pool.details.incentives.rewards.label")}
          description={t(
            "liquidity.pool.details.incentives.rewards.description",
          )}
        >
          <div sx={{ flex: "row", gap: 6 }}>
            <Text fs={16} color="brightBlue200">
              {t("value.percentage", { value: totalApr })}
            </Text>
            <MultipleIcons
              size={20}
              icons={validIncentives.map((incentive) => {
                const id = getAssetIdFromAddress(incentive.rewardTokenAddress)

                return {
                  icon: <AssetLogo key={id} id={id} />,
                }
              })}
            />
          </div>
        </AvailableIncentive>
      )}
      <AvailableIncentive
        label={t("apy")}
        description={t("liquidity.pool.details.incentives.apy.description")}
      >
        <div sx={{ flex: "row", gap: 6 }}>
          <Text fs={16} color="brightBlue200">
            {t("value.percentage", { value: totalApy })}
          </Text>
          <InfoTooltip
            preventDefault
            text={
              <>
                <Text fs={12}>{t("lending.tooltip.estimatedRewards")}</Text>
                {lpFeeOmnipool && (
                  <div
                    sx={{
                      flex: "row",
                      gap: 4,
                      justify: "space-between",
                      mt: 6,
                    }}
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
                    sx={{
                      flex: "row",
                      gap: 4,
                      justify: "space-between",
                      mt: 6,
                    }}
                  >
                    <Text fs={10} tTransform="uppercase" sx={{ opacity: 0.8 }}>
                      {t("liquidity.table.farms.apr.lpFeeStablepool")}
                    </Text>
                    <Text fs={12} font="GeistSemiBold">
                      {t("value.percentage", { value: BN(lpFeeStablepool) })}
                    </Text>
                  </div>
                )}

                {moneyMarketApy.underlyingAssetsApyData.map(
                  ({ id, apyType, supplyApy }) => {
                    const label = getApyLabel(apyType)

                    return (
                      <IncentiveRow
                        key={id}
                        id={id}
                        label={label}
                        value={t("value.percentage", {
                          value: BN(supplyApy),
                        })}
                      />
                    )
                  },
                )}
              </>
            }
          />
        </div>
      </AvailableIncentive>
    </>
  )
}

const AvailableIncentive = ({
  label,
  description,
  children,
}: {
  label: string
  description: string
  children: ReactNode
}) => (
  <SContainer
    sx={{
      flexDirection: "row",
      align: "center",
      py: [8, 8],
    }}
  >
    <div sx={{ flex: "column", gap: 6 }}>
      <Text fs={16}>{label}</Text>
      <Text fs={11} color="darkBlue200">
        {description}
      </Text>
    </div>
    {children}
  </SContainer>
)
