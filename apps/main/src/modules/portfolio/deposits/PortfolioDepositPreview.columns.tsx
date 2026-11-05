import { ChevronRightIcon } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  Stack,
  TableRowAction,
  TableRowDetailsExpand,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { numericallyStr, sortBy } from "@/utils/sort"

import { PortfolioDepositSample } from "./PortfolioDepositPreview.mock"
import { PORTFOLIO_DEPOSIT_CLAIM_PRIORITY } from "./PortfolioDepositPreview.utils"
import { PortfolioDepositStatus } from "./PortfolioDepositStatus"

const columnHelper = createColumnHelper<PortfolioDepositSample>()

export const usePortfolioDepositPreviewColumns = (
  onSelect: (deposit: PortfolioDepositSample) => void,
  onClaim: (deposit: PortfolioDepositSample) => void,
) => {
  const { t } = useTranslation(["onramp", "common"])
  const { isMobile } = useBreakpoints()
  return useMemo(() => {
    const claimPriorityColumn = columnHelper.accessor(
      (deposit) => Number(deposit.status === "claimable"),
      {
        id: PORTFOLIO_DEPOSIT_CLAIM_PRIORITY,
        meta: { visibility: false },
        sortingFn: "basic",
      },
    )
    const columns = [
      claimPriorityColumn,
      columnHelper.accessor("symbol", {
        id: "asset",
        header: t("common:asset"),
        cell: ({ row }) => {
          const deposit = row.original
          return (
            <Flex
              gap="base"
              align="center"
              data-claimable={deposit.status === "claimable"}
            >
              <AssetLogo id={deposit.assetId} size="small" />
              <Stack gap="xs">
                <Text fs="p5" fw={500} color={getToken("text.high")}>
                  {t("common:currency", {
                    value: deposit.amount,
                    symbol: deposit.symbol,
                  })}
                </Text>
                <Text
                  fs="p6"
                  color={getToken("text.medium")}
                  display={["block", null, "none"]}
                >
                  {deposit.source} ·{" "}
                  {t(`deposit.portfolio.method.${deposit.method}`)}
                </Text>
              </Stack>
            </Flex>
          )
        },
      }),
      columnHelper.accessor("source", {
        header: t("common:from"),
        meta: { gteBp: "md" },
        cell: ({ row }) => (
          <Stack gap="xs">
            <Text fs="p5" fw={500} color={getToken("text.high")}>
              {row.original.source}
            </Text>
            {row.original.network !== row.original.source && (
              <Text fs="p6" color={getToken("text.medium")}>
                {row.original.network}
              </Text>
            )}
          </Stack>
        ),
      }),
      columnHelper.accessor("method", {
        header: t("deposit.portfolio.table.method"),
        meta: { gteBp: "lg" },
        cell: ({ row }) => (
          <Text fs="p5" color={getToken("text.medium")}>
            {t(`deposit.portfolio.method.${row.original.method}`)}
          </Text>
        ),
      }),
      columnHelper.accessor("createdAt", {
        id: "date",
        header: t("common:date"),
        meta: { gteBp: "md" },
        cell: ({ row }) => (
          <Text fs="p5" color={getToken("text.medium")}>
            {t("common:date.datetime.short", { value: row.original.createdAt })}
          </Text>
        ),
      }),
      columnHelper.accessor("status", {
        header: t("common:status"),
        cell: ({ row }) => (
          <PortfolioDepositStatus status={row.original.status} />
        ),
      }),
      columnHelper.display({
        id: "details",
        header: "",
        enableSorting: false,
        meta: { sx: { textAlign: "right" } },
        cell: ({ row }) => (
          <Flex justify="flex-end" align="center" gap="s">
            {row.original.status === "claimable" && (
              <TableRowAction
                size="small"
                variant="secondary"
                outline={false}
                onClick={(event) => {
                  event.stopPropagation()
                  onClaim(row.original)
                }}
                aria-label={t("deposit.portfolio.table.claimLabel", {
                  symbol: row.original.symbol,
                  source: row.original.source,
                })}
              >
                {t("common:claim")}
              </TableRowAction>
            )}
            <TableRowAction
              size="small"
              onClick={() => onSelect(row.original)}
              aria-label={t("deposit.portfolio.table.detailsLabel", {
                symbol: row.original.symbol,
                source: row.original.source,
              })}
            >
              <Text as="span" fs="p5" display={["none", null, "inline"]}>
                {t("common:details")}
              </Text>
              <Icon component={ChevronRightIcon} size="s" aria-hidden />
            </TableRowAction>
          </Flex>
        ),
      }),
    ]

    const [mobileAssetColumn, amountColumn] = [
      columnHelper.accessor("symbol", {
        id: "asset",
        header: t("common:asset"),
        enableSorting: false,
        cell: ({ row }) => (
          <Flex
            gap="base"
            align="center"
            minWidth={0}
            data-claimable={row.original.status === "claimable"}
          >
            <AssetLogo id={row.original.assetId} size="small" />
            <Stack gap="xs" minWidth={0}>
              <Text fs="p5" fw={500} truncate>
                {row.original.symbol}
              </Text>
              <Text fs="p6" color={getToken("text.medium")} truncate>
                {row.original.source}
              </Text>
            </Stack>
          </Flex>
        ),
      }),
      columnHelper.accessor("amount", {
        header: t("common:amount"),
        meta: { sx: { textAlign: "right" } },
        sortingFn: sortBy({
          select: (row) => row.original.amount,
          compare: numericallyStr,
        }),
        cell: ({ row }) => (
          <TableRowDetailsExpand
            onClick={() => onSelect(row.original)}
            aria-label={t("deposit.portfolio.table.detailsLabel", {
              symbol: row.original.symbol,
              source: row.original.source,
            })}
          >
            <Stack gap="xs" align="flex-end" minWidth={0}>
              <Text fs="p5" fw={500} truncate>
                {t("common:number", { value: row.original.amount })}
              </Text>
              {row.original.status === "claimable" ? (
                <TableRowAction
                  variant="secondary"
                  outline={false}
                  size="small"
                  onClick={() => onClaim(row.original)}
                  aria-label={t("deposit.portfolio.table.claimLabel", {
                    symbol: row.original.symbol,
                    source: row.original.source,
                  })}
                >
                  {t("common:claim")}
                </TableRowAction>
              ) : (
                <PortfolioDepositStatus status={row.original.status} compact />
              )}
            </Stack>
          </TableRowDetailsExpand>
        ),
      }),
    ] as const

    // Retain hidden accessors so sorting survives a change of screen size.
    return isMobile
      ? [
          ...columns
            .filter(({ id }) => id !== "asset" && id !== "details")
            .map((column) => ({
              ...column,
              meta: { ...column.meta, visibility: false },
            })),
          mobileAssetColumn,
          amountColumn,
        ]
      : [
          ...columns,
          {
            ...amountColumn,
            meta: { ...amountColumn.meta, visibility: false },
          },
        ]
  }, [t, onSelect, onClaim, isMobile])
}
