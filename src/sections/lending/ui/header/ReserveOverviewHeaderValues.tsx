import { DataValue, DataValueList } from "components/DataValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import {
  ComputedReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { Text } from "components/Typography/Text/Text"

export type ReserveOverviewHeaderValuesProps = {
  className?: string
  underlyingAsset: string
}

const ReserveIcon = () => {
  return (
    <div
      mr={3}
      sx={{
        mr: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {loading ? (
        <Skeleton
          variant="circular"
          width={40}
          height={40}
          sx={{ background: "#383D51" }}
        />
      ) : (
        <img
          src={`https://app.aave.com/icons/tokens/${poolReserve.iconSymbol.toLowerCase()}.svg`}
          width="40px"
          height="40px"
          alt=""
        />
      )}
    </div>
  )
}

export const ReserveOverviewHeaderValues: FC<
  ReserveOverviewHeaderValuesProps
> = ({ underlyingAsset, className }) => {
  const { t } = useTranslation()
  const { reserves, loading } = useAppDataContext()

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset,
  ) as ComputedReserveData

  return (
    <div sx={{ flex: "row", align: "center", gap: 40 }} className={className}>
      <div sx={{ flex: "row", gap: 8, align: "center" }}>
        <div>
          <img
            src={`https://app.aave.com/icons/tokens/${poolReserve.iconSymbol.toLowerCase()}.svg`}
            sx={{ width: 32, height: 32 }}
            alt=""
          />
        </div>
        <div>
          <Text fs={18} lh={24} font="ChakraPetchBold">
            {poolReserve.symbol}
          </Text>
          <Text fs={14} lh={18}>
            {poolReserve.name}
          </Text>
        </div>
      </div>
      <DataValueList>
        <DataValue
          size="medium"
          isLoading={loading}
          labelColor="brightBlue300"
          label="Reserve size"
        >
          <DisplayValue
            isUSD
            compact
            value={Math.max(Number(poolReserve?.totalLiquidityUSD), 0)}
          />
        </DataValue>
        <DataValue
          size="medium"
          isLoading={loading}
          labelColor="brightBlue300"
          label="Available liquidity"
        >
          <DisplayValue
            isUSD
            compact
            value={Math.max(Number(poolReserve?.availableLiquidityUSD), 0)}
          />
        </DataValue>
        <DataValue
          size="medium"
          isLoading={loading}
          labelColor="brightBlue300"
          label="Utilization rate"
        >
          {t("value.percentage", {
            value: Number(poolReserve?.borrowUsageRatio ?? 0) * 100,
          })}
        </DataValue>
        <DataValue
          size="medium"
          isLoading={loading}
          labelColor="brightBlue300"
          label="Oracle price"
        >
          <DisplayValue isUSD value={Number(poolReserve?.priceInUSD ?? 0)} />
        </DataValue>
      </DataValueList>
    </div>
  )
}
