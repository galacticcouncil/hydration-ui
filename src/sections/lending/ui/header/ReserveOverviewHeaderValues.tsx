import { DataValue, DataValueList } from "components/DataValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useMedia } from "react-use"
import { PercentageValue } from "components/PercentageValue"
import {
  ComputedReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { theme } from "theme"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"
import { useRootStore } from "sections/lending/store/root"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { useTranslation } from "react-i18next"

export type ReserveOverviewHeaderValuesProps = {
  className?: string
  underlyingAsset: string
  aToken?: boolean
}

export const ReserveOverviewHeaderValues: FC<
  ReserveOverviewHeaderValuesProps
> = ({ underlyingAsset, className, aToken }) => {
  const { t } = useTranslation()
  const { reserves, loading } = useAppDataContext()
  const { currentMarket } = useProtocolDataContext()
  const displayGho = useRootStore((store) => store.displayGho)

  const isDesktop = useMedia(theme.viewport.gte.sm)

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset,
  ) as ComputedReserveData

  const isGho = displayGho({ symbol: poolReserve.symbol, currentMarket })

  return (
    <div
      sx={{
        flex: ["column", "row"],
        align: ["start", "center"],
        gap: [20, 40],
      }}
      className={className}
    >
      <div sx={{ flex: "row", gap: 12, align: "center" }}>
        <TokenIcon
          address={poolReserve.underlyingAsset}
          aToken={aToken}
          size={30}
        />
        <div>
          <Text fs={18} lh={24} font="GeistSemiBold">
            {poolReserve.symbol}
          </Text>
          <Text fs={14} lh={18}>
            {poolReserve.name}
          </Text>
        </div>
      </div>
      <DataValueList separated={!isDesktop} sx={{ width: ["100%", "auto"] }}>
        <DataValue
          size="medium"
          isLoading={loading}
          labelColor="brightBlue300"
          label={t("lending.reserve.reserveSize")}
        >
          <DisplayValue
            isUSD
            compact
            value={Math.max(Number(poolReserve?.totalLiquidityUSD), 0)}
          />
        </DataValue>
        {isGho ? (
          <>
            <DataValue
              size="medium"
              isLoading={loading}
              labelColor="brightBlue300"
              label={t("lending.reserve.maxToBorrow")}
            >
              <DisplayValue
                isUSD
                compact
                value={Math.max(Number(poolReserve.borrowCap), 0)}
              />
            </DataValue>
            <DataValue
              size="medium"
              isLoading={loading}
              labelColor="brightBlue300"
              label={t("price")}
            >
              <DisplayValue isUSD value={1} />
            </DataValue>
          </>
        ) : (
          <>
            <DataValue
              size="medium"
              isLoading={loading}
              labelColor="brightBlue300"
              label={t("lending.reserve.availableLiq")}
            >
              <DisplayValue
                isUSD
                compact
                value={Math.max(Number(poolReserve?.availableLiquidityUSD), 0)}
              />
            </DataValue>
            {poolReserve?.borrowUsageRatio !== "0" && (
              <DataValue
                size="medium"
                isLoading={loading}
                labelColor="brightBlue300"
                label={t("lending.reserve.utilRate")}
              >
                <PercentageValue
                  value={Number(poolReserve?.borrowUsageRatio ?? 0) * 100}
                />
              </DataValue>
            )}
            <DataValue
              size="medium"
              isLoading={loading}
              labelColor="brightBlue300"
              label={t("lending.reserve.oraclePrice")}
            >
              <DisplayValue
                isUSD
                value={Number(poolReserve?.priceInUSD ?? 0)}
              />
            </DataValue>
          </>
        )}
      </DataValueList>
    </div>
  )
}
