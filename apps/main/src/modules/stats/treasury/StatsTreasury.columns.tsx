import { Amount } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { TreasuryCompositionAsset } from "@/api/treasury"
import { AssetLabelFull } from "@/components/AssetLabelFull"
const columnHelper = createColumnHelper<TreasuryCompositionAsset>()

export const useStatsTreasuryColumns = () => {
  const { t } = useTranslation("common")
  const { isMobile } = useBreakpoints()

  const columns = useMemo(() => {
    // Accessor required so DataTable globalFilter can run (display cols are skipped).
    const assetColumn = columnHelper.accessor((row) => row.asset.symbol, {
      id: "symbol",
      header: t("asset"),
      meta: {
        sx: {
          maxWidth: isMobile ? "150px" : "200px",
        },
      },
      cell: ({ row }) => {
        return <AssetLabelFull asset={row.original.asset} />
      },
    })

    const balanceColumn = columnHelper.accessor("totalValueDisplay", {
      id: "totalValueDisplay",
      header: t("totalNetValue"),
      meta: !isMobile
        ? undefined
        : {
            sx: {
              textAlign: "right",
            },
          },
      cell: ({ row }) => {
        return (
          <Amount
            value={t("number.compact", {
              value: row.original.totalBalance,
            })}
            displayValue={t("currency.compact", {
              value: row.original.totalValueDisplay,
            })}
          />
        )
      },
    })

    const shareColumn = columnHelper.accessor("share", {
      id: "share",
      header: t("composition"),
      meta: {
        sx: {
          textAlign: "right",
        },
      },
      cell: ({ row }) => {
        return (
          <Amount
            value={t("percent", {
              value: row.original.share,
            })}
          />
        )
      },
    })

    return isMobile
      ? [assetColumn, balanceColumn]
      : [assetColumn, balanceColumn, shareColumn]
  }, [t, isMobile])

  return columns as Array<ColumnDef<TreasuryCompositionAsset>>
}
