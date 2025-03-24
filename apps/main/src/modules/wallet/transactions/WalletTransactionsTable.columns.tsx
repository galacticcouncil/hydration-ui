import {
  ArrowRight,
  ArrowUpFromDot,
  ArrowUpRight,
} from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetAmount } from "@/components/AssetAmount/AssetAmount"
import { useAssets } from "@/providers/assetsProvider"

export type TransactionMock = {
  readonly type: string
  readonly failed?: boolean
  readonly timestamp: string
  readonly assetId: string
  readonly total: string
  readonly transferable: string
  readonly addressFrom: string
  readonly addressTo: string
}

const columnHelper = createColumnHelper<TransactionMock>()

export const useWalletTransactionsColumns = () => {
  const { t } = useTranslation(["wallet", "common"])
  const { getAssetWithFallback } = useAssets()

  return useMemo(() => {
    const assetColumn = columnHelper.display({
      header: t("transactions.table.header.asset"),
      cell: ({ row }) => {
        return (
          <Flex gap={6} align="center">
            <Icon
              component={ArrowUpFromDot}
              size={18}
              color={getToken("icons.onContainer")}
            />
            <Flex direction="column">
              <Text fw={500} fs={12} lh={px(15)} color={getToken("text.high")}>
                {row.original.type}
              </Text>
              <Text fs={11} lh={px(15)} color={getToken("text.medium")}>
                {row.original.timestamp}
              </Text>
            </Flex>
          </Flex>
        )
      },
    })

    const totalBalanceColumn = columnHelper.accessor("total", {
      header: t("transactions.table.header.totalBalance"),
      cell: ({ row }) => {
        const asset = getAssetWithFallback(row.original.assetId)

        return <AssetAmount asset={asset} amount={row.original.total} />
      },
    })

    const transferableBalanceColumn = columnHelper.accessor("transferable", {
      header: t("transactions.table.header.transferableBalance"),
      cell: ({ row }) => {
        const asset = getAssetWithFallback(row.original.assetId)

        return <AssetAmount asset={asset} amount={row.original.transferable} />
      },
    })

    const addressColumn = columnHelper.display({
      id: "address",
      cell: ({ row }) => {
        return (
          <Text
            fw={500}
            fs={13}
            lh={px(18)}
            color={getToken("text.high")}
            sx={{ minWidth: 330 }}
          >
            <Flex justify="space-between" align="center">
              {shortenAccountAddress(row.original.addressFrom)}
              <Icon
                component={ArrowRight}
                size={18}
                color={getToken("icons.onContainer")}
              />
              {shortenAccountAddress(row.original.addressTo)}
            </Flex>
          </Text>
        )
      },
    })

    const actionsColumn = columnHelper.display({
      header: t("common:actions"),
      meta: {
        sx: {
          textAlign: "right",
        },
      },
      cell: () => {
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
      addressColumn,
      actionsColumn,
    ]
  }, [t, getAssetWithFallback])
}
