import {
  MoneyMarketEventFragment,
  MoneyMarketEventName,
} from "@galacticcouncil/indexer/squid"
import { Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetAmountDescription } from "@/modules/borrow/history/descriptions/AssetAmountDescription"
import { CollateralDescription } from "@/modules/borrow/history/descriptions/CollateralDescription"
import { EModeDescription } from "@/modules/borrow/history/descriptions/EModeDescription"
import { LiquidationCallDescription } from "@/modules/borrow/history/descriptions/LiquidationCallDescription"
import { useFormatEventName } from "@/modules/borrow/history/utils"

export type MoneyMarketEventWithDate = MoneyMarketEventFragment & {
  readonly date: Date
}

export type BorrowHistoryRow = MoneyMarketEventWithDate | Date

const columnHelper = createColumnHelper<BorrowHistoryRow>()

export const useBorrowHistoryColumns = () => {
  const { t } = useTranslation(["common", "borrow"])
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
            <Text fs={12} fw={500} color={getToken("text.medium")}>
              {t("date.long", {
                value: row.original,
              })}
            </Text>
          )
        }

        return (
          <div>
            <Text fs={14} fw={500}>
              {formatEventName(row.original.eventName as MoneyMarketEventName)}
            </Text>
            <Text color={getToken("text.medium")} fs={12}>
              <span
                title={t("date.long", {
                  value: row.original.date,
                })}
              >
                {t("date.time", {
                  value: row.original.date,
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

        switch (event.eventName as MoneyMarketEventName) {
          case "Supply":
            return (
              event.supply && (
                <AssetAmountDescription
                  assetId={event.supply.asset?.assetRegistryId}
                  amount={event.supply.amount || "0"}
                />
              )
            )
          case "Borrow":
            return (
              event.borrow && (
                <AssetAmountDescription
                  assetId={event.borrow.asset?.assetRegistryId}
                  amount={event.borrow.amount || "0"}
                />
              )
            )
          case "Repay":
            return (
              event.repay && (
                <AssetAmountDescription
                  assetId={event.repay.asset?.assetRegistryId}
                  amount={event.repay.amount || "0"}
                />
              )
            )
          case "Withdraw":
            return (
              event.withdraw && (
                <AssetAmountDescription
                  assetId={event.withdraw.asset?.assetRegistryId}
                  amount={event.withdraw.amount || "0"}
                />
              )
            )
          case "ReserveUsedAsCollateralEnabled":
            return (
              event.reserveUsedAsCollateralEnabled && (
                <CollateralDescription
                  assetId={
                    event.reserveUsedAsCollateralEnabled.asset?.assetRegistryId
                  }
                  enabled
                />
              )
            )
          case "ReserveUsedAsCollateralDisabled":
            return (
              event.reserveUsedAsCollateralDisabled && (
                <CollateralDescription
                  assetId={
                    event.reserveUsedAsCollateralDisabled.asset?.assetRegistryId
                  }
                  enabled={false}
                />
              )
            )
          case "LiquidationCall":
            return (
              event.liquidationCall && (
                <LiquidationCallDescription
                  assetId={event.liquidationCall.asset?.assetRegistryId}
                  amount={event.liquidationCall.amount || "0"}
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
