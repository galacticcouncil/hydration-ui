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
import { patchGigaReserveSymbolAndName } from "sections/lending/ui-config/reservePatches"

export type ReserveOverviewHeaderValuesProps = {
  className?: string
  underlyingAsset: string
}

export const ReserveOverviewHeaderValues: FC<
  ReserveOverviewHeaderValuesProps
> = ({ underlyingAsset, className }) => {
  const { t } = useTranslation()
  const { reserves, loading } = useAppDataContext()
  const { currentMarket } = useProtocolDataContext()
  const displayGho = useRootStore((store) => store.displayGho)

  const isDesktop = useMedia(theme.viewport.gte.sm)

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset,
  ) as ComputedReserveData

  const reserve = {
    ...poolReserve,
    ...patchGigaReserveSymbolAndName(poolReserve),
  }

  const isGho = displayGho({ symbol: reserve.symbol, currentMarket })

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
        <TokenIcon address={reserve.underlyingAsset} size={38} />
        <div>
          <Text fs={18} lh={24} font="GeistSemiBold">
            {reserve.symbol}
          </Text>
          <Text fs={14} lh={18}>
            {reserve.name}
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
            value={Math.max(Number(reserve?.totalLiquidityUSD), 0)}
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
                value={Math.max(Number(reserve.borrowCap), 0)}
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
                value={Math.max(Number(reserve?.availableLiquidityUSD), 0)}
              />
            </DataValue>
            <DataValue
              size="medium"
              isLoading={loading}
              labelColor="brightBlue300"
              label={t("lending.reserve.utilRate")}
            >
              <PercentageValue
                value={Number(reserve?.borrowUsageRatio ?? 0) * 100}
              />
            </DataValue>
            <DataValue
              size="medium"
              isLoading={loading}
              labelColor="brightBlue300"
              label={t("lending.reserve.oraclePrice")}
            >
              <DisplayValue isUSD value={Number(reserve?.priceInUSD ?? 0)} />
            </DataValue>
          </>
        )}
      </DataValueList>
    </div>
  )
}
