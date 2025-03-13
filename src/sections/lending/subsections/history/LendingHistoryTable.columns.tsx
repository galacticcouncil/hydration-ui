import { EventName } from "sections/lending/subsections/history/types"
import { createColumnHelper } from "@tanstack/react-table"
import { MoneyMarketEventFragment } from "graphql/__generated__/squid/graphql"
import { useMemo } from "react"
import { LiquidationCallDescription } from "sections/lending/subsections/history/descriptions/LiquidationCallDescription"
import { EModeDescription } from "sections/lending/subsections/history/descriptions/EModeDescription"
import { useFormatEventName } from "sections/lending/subsections/history/utils"
import { AssetAmountDescription } from "sections/lending/subsections/history/descriptions/AssetAmountDescription"
import { CollateralDescription } from "sections/lending/subsections/history/descriptions/CollateralDescription"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

export type MoneyMarketEventWithDate = MoneyMarketEventFragment & {
  readonly date: Date
}

export type LendingHistoryRow = MoneyMarketEventWithDate | Date

const columnHelper = createColumnHelper<LendingHistoryRow>()

export const useLendingHistoryColumns = () => {
  const { t } = useTranslation()
  const formatEventName = useFormatEventName()

  return useMemo(() => {
    const eventName = columnHelper.display({
      header: t("type"),
      meta: {
        sx: { width: "20%" },
      },
      cell({ row }) {
        if (row.original instanceof Date) {
          return (
            <Text fs={12} color="darkBlue200">
              {t("stats.overview.chart.tvl.label.date", {
                date: row.original,
              })}
            </Text>
          )
        }

        return (
          <div>
            <Text color="basic200" fs={14}>
              {formatEventName(row.original.eventName as EventName)}
            </Text>
            <Text color="darkBlue200" fs={12} lh={14}>
              <span
                title={t("stats.overview.table.trades.value.totalValueTime", {
                  date: row.original.date,
                })}
              >
                {t("stats.overview.chart.tvl.label.time", {
                  date: row.original.date,
                })}
              </span>
            </Text>
          </div>
        )
      },
    })

    const description = columnHelper.display({
      header: t("description"),
      meta: {
        sx: {
          textAlign: ["right", "left"],
        },
      },
      cell({ row }) {
        if (row.original instanceof Date) {
          return
        }

        const event = row.original

        switch (event.eventName as EventName) {
          case "Supply":
            return (
              event.supply && (
                <AssetAmountDescription
                  assetId={event.supply.assetId}
                  amount={event.supply.amount}
                />
              )
            )
          case "Borrow":
            return (
              event.borrow && (
                <AssetAmountDescription
                  assetId={event.borrow.assetId}
                  amount={event.borrow.amount}
                />
              )
            )
          case "Repay":
            return (
              event.repay && (
                <AssetAmountDescription
                  assetId={event.repay.assetId}
                  amount={event.repay.amount}
                />
              )
            )
          case "Withdraw":
            return (
              event.withdraw && (
                <AssetAmountDescription
                  assetId={event.withdraw.assetId}
                  amount={event.withdraw.amount}
                />
              )
            )
          case "ReserveUsedAsCollateralEnabled":
            return (
              event.reserveUsedAsCollateralEnabled && (
                <CollateralDescription
                  assetId={event.reserveUsedAsCollateralEnabled.assetId}
                  enabled
                />
              )
            )
          case "ReserveUsedAsCollateralDisabled":
            return (
              event.reserveUsedAsCollateralDisabled && (
                <CollateralDescription
                  assetId={event.reserveUsedAsCollateralDisabled.assetId}
                  enabled={false}
                />
              )
            )
          case "LiquidationCall":
            return (
              event.liquidationCall && (
                <LiquidationCallDescription
                  assetId={event.liquidationCall.assetId}
                  amount={event.liquidationCall.amount}
                />
              )
            )
          case "UserEModeSet":
            return (
              event.userEModeSet && <EModeDescription {...event.userEModeSet} />
            )
          default:
            return ""
        }
      },
    })

    return [eventName, description]
  }, [t, formatEventName])
}
