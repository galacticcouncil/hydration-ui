import {
  ArrowRight,
  ArrowUpFromDot,
  ArrowUpRight,
} from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetAmount } from "@/components/AssetAmount/AssetAmount"
import { WalletTransactionAddressColumn } from "@/modules/wallet/transactions/WalletTransactionAddressColumn"
import { TransactionMock } from "@/modules/wallet/transactions/WalletTransactionsTable.data"
import { useAssets } from "@/providers/assetsProvider"

export type WalletTransactionRow = Date | TransactionMock

const columnHelper = createColumnHelper<WalletTransactionRow>()

export const useWalletTransactionsColumns = () => {
  const { t } = useTranslation(["wallet", "common"])
  const { getAssetWithFallback } = useAssets()

  return useMemo(() => {
    const assetColumn = columnHelper.display({
      header: t("transactions.table.header.asset"),
      cell: ({ row }) => {
        if (row.original instanceof Date) {
          return (
            <Text fs={11} lh={px(15)} color={getToken("text.medium")}>
              {t("common:date", { value: row.original })}
            </Text>
          )
        }

        return (
          <Flex gap={6} align="center">
            <Icon
              component={ArrowUpFromDot}
              size={18}
              color={getToken("icons.onContainer")}
            />
            <Flex direction="column">
              <Text
                fw={500}
                fs={12}
                lh={px(15)}
                color={getToken("text.high")}
                transform="capitalize"
              >
                {row.original.type}
              </Text>
              <Text fs={11} lh={px(15)} color={getToken("text.medium")}>
                {t("common:date.time", { value: row.original.timestamp })}
              </Text>
            </Flex>
          </Flex>
        )
      },
    })

    const totalBalanceColumn = columnHelper.accessor("total", {
      header: t("transactions.table.header.totalBalance"),
      cell: ({ row }) => {
        if (row.original instanceof Date) {
          return null
        }

        const asset = getAssetWithFallback(row.original.assetId)

        return <AssetAmount asset={asset} amount={row.original.total} />
      },
    })

    const transferableBalanceColumn = columnHelper.accessor("transferable", {
      header: t("transactions.table.header.transferableBalance"),
      cell: ({ row }) => {
        if (row.original instanceof Date) {
          return null
        }

        const asset = getAssetWithFallback(row.original.assetId)

        return <AssetAmount asset={asset} amount={row.original.transferable} />
      },
    })

    const sourceColumn = columnHelper.accessor("addressFrom", {
      header: t("common:source"),
      meta: {
        sx: {
          textAlign: "center",
        },
      },
      cell: ({ row }) => {
        if (row.original instanceof Date) {
          return null
        }

        return (
          <WalletTransactionAddressColumn>
            {row.original.addressFrom}
          </WalletTransactionAddressColumn>
        )
      },
    })

    const addressArrowColumn = columnHelper.display({
      id: "address",
      cell: ({ row }) => {
        if (row.original instanceof Date) {
          return null
        }

        return (
          <Icon
            component={ArrowRight}
            size={18}
            color={getToken("icons.onContainer")}
          />
        )
      },
    })

    const destinationColumn = columnHelper.accessor("addressTo", {
      header: t("common:destination"),
      meta: {
        sx: {
          textAlign: "center",
        },
      },
      cell: ({ row }) => {
        if (row.original instanceof Date) {
          return null
        }

        return (
          <WalletTransactionAddressColumn>
            {row.original.addressTo}
          </WalletTransactionAddressColumn>
        )
      },
    })

    const detailsColumn = columnHelper.display({
      header: t("common:details"),
      meta: {
        sx: {
          textAlign: "right",
        },
      },
      cell: ({ row }) => {
        if (row.original instanceof Date) {
          return null
        }

        return (
          <Icon
            component={ArrowUpRight}
            size={18}
            color={getToken("icons.onContainer")}
            sx={{ ml: "auto" }}
          />
        )
      },
    })

    return [
      assetColumn,
      totalBalanceColumn,
      transferableBalanceColumn,
      sourceColumn,
      addressArrowColumn,
      destinationColumn,
      detailsColumn,
    ]
  }, [t, getAssetWithFallback])
}
