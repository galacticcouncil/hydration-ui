import { Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { MoneyMarketEvent } from "@/api/borrow"
import { AssetAmountDescription } from "@/modules/borrow/history/descriptions/AssetAmountDescription"
import { CollateralDescription } from "@/modules/borrow/history/descriptions/CollateralDescription"
import { EModeDescription } from "@/modules/borrow/history/descriptions/EModeDescription"
import { LiquidationCallDescription } from "@/modules/borrow/history/descriptions/LiquidationCallDescription"
import { useFormatEventName } from "@/modules/borrow/history/utils"

export type BorrowHistoryRow = MoneyMarketEvent | Date

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
            <Text fs="p5" fw={500} color={getToken("text.medium")}>
              {t("date.long", {
                value: row.original,
              })}
            </Text>
          )
        }

        return (
          <>
            <Text fs="p3" color={getToken("text.high")}>
              {formatEventName(row.original.eventName)}
            </Text>
            <Text color={getToken("text.medium")} fs="p5">
              <Text
                as="span"
                title={t("date.long", {
                  value: row.original.date,
                })}
              >
                {t("date.time", {
                  value: row.original.date,
                })}
              </Text>
            </Text>
          </>
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

        const { eventName, assetId, amount, categoryId } = row.original

        switch (eventName) {
          case "Supply":
          case "Borrow":
          case "Repay":
          case "Withdraw":
            return (
              <AssetAmountDescription
                assetId={assetId}
                amount={amount || "0"}
              />
            )
          case "ReserveUsedAsCollateralEnabled":
            return <CollateralDescription assetId={assetId} enabled />
          case "ReserveUsedAsCollateralDisabled":
            return <CollateralDescription assetId={assetId} enabled={false} />
          case "LiquidationCall":
            return (
              <LiquidationCallDescription
                assetId={assetId}
                amount={amount || "0"}
              />
            )
          case "UserEModeSet":
            return <EModeDescription categoryId={categoryId} />
          default:
            return ""
        }
      },
    })

    return [eventName, description]
  }, [t, formatEventName])
}
