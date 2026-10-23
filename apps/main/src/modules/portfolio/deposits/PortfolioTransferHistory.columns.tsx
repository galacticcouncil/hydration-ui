import { ChevronRightIcon } from "@galacticcouncil/ui/assets/icons"
import {
  ExternalLink,
  Flex,
  Icon,
  Stack,
  TableRowAction,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AccountIdentity } from "@/components/AccountIdentity"
import { ClaimButton } from "@/modules/xcm/history/components/ClaimButton"
import { JourneyAssetLogo } from "@/modules/xcm/history/components/JourneyAssetLogo"
import { JourneyChainLogo } from "@/modules/xcm/history/components/JourneyChainLogo"
import { JourneyProtocol } from "@/modules/xcm/history/components/JourneyProtocol"
import { usePendingClaimsStore } from "@/modules/xcm/history/hooks/usePendingClaimsStore"
import {
  getTransferAsset,
  getTransferUsdValue,
} from "@/modules/xcm/history/utils/assets"
import {
  isJourneyPendingClaim,
  resolveChainFromUrn,
} from "@/modules/xcm/history/utils/claim"
import {
  FAILED_STATUSES,
  getFormattedAddresses,
  getJourneyExplorerLink,
  SUCCESS_STATUSES,
} from "@/modules/xcm/history/utils/journey"
import { isOptimisticJourney } from "@/modules/xcm/history/utils/optimistic"
import { toDecimal } from "@/utils/formatting"

import { PortfolioDepositStatus } from "./PortfolioDepositStatus"

const columnHelper = createColumnHelper<XcJourney>()

export const usePortfolioTransferHistoryColumns = () => {
  const { t } = useTranslation(["common", "xcm"])
  const { isMobile } = useBreakpoints()
  const pendingCorrelationIds = usePendingClaimsStore(
    (state) => state.pendingCorrelationIds,
  )

  return useMemo(() => {
    const renderStatus = (journey: XcJourney) => (
      <PortfolioDepositStatus
        status={
          SUCCESS_STATUSES.includes(journey.status)
            ? "completed"
            : FAILED_STATUSES.includes(journey.status)
              ? "failed"
              : journey.status === "waiting"
                ? "confirming"
                : "processing"
        }
        label={t(`xcm:journey.status.${journey.status}`, {
          defaultValue: journey.status,
        })}
      />
    )
    const renderActions = (journey: XcJourney) => (
      <Flex align="center" justify="flex-end" gap="s">
        {!pendingCorrelationIds.includes(journey.correlationId) &&
          isJourneyPendingClaim(journey) && <ClaimButton journey={journey} />}
        {isOptimisticJourney(journey) ? (
          <TableRowAction size="small" disabled>
            {t("details")}
            <Icon component={ChevronRightIcon} size="s" aria-hidden />
          </TableRowAction>
        ) : (
          <TableRowAction size="small" asChild>
            <ExternalLink href={getJourneyExplorerLink(journey)}>
              {t("details")}
              <Icon component={ChevronRightIcon} size="s" aria-hidden />
            </ExternalLink>
          </TableRowAction>
        )}
      </Flex>
    )
    const assetColumn = columnHelper.accessor("assets", {
      id: "assets",
      header: t("asset"),
      cell: ({ row }) => {
        const journey = row.original
        const asset = getTransferAsset(journey)
        if (!asset) return null
        const usd = getTransferUsdValue(journey, asset)
        return (
          <Flex gap="base" align="center" minWidth={0}>
            <JourneyAssetLogo assetKey={asset.asset} size="small" />
            <Stack gap="xs" minWidth={0}>
              <Text fs="p5" fw={500} truncate>
                {isMobile
                  ? asset.symbol
                  : t("currency", {
                      value: toDecimal(asset.amount, asset.decimals),
                      symbol: asset.symbol,
                    })}
              </Text>
              {isMobile ? (
                <Text fs="p6" color="text.medium" truncate>
                  {resolveChainFromUrn(journey.origin)?.name ?? journey.origin}
                  {" → "}
                  {resolveChainFromUrn(journey.destination)?.name ??
                    journey.destination}
                </Text>
              ) : usd > 0 ? (
                <Text fs="p6" color="text.medium">
                  {t("currency", { value: usd })}
                </Text>
              ) : null}
            </Stack>
          </Flex>
        )
      },
    })
    const chainColumns = (["from", "to"] as const).map((direction) =>
      columnHelper.accessor(direction, {
        id: direction,
        header: t(direction),
        meta: { gteBp: "md" },
        cell: ({ row }) => {
          const journey = row.original
          const urn =
            direction === "from" ? journey.origin : journey.destination
          const address = getFormattedAddresses(journey)[direction]
          return (
            <Flex align="center" gap="base">
              <JourneyChainLogo networkUrn={urn} />
              <Stack gap="xs">
                <Text fs="p5" fw={500}>
                  {resolveChainFromUrn(urn)?.name ?? urn}
                </Text>
                <AccountIdentity
                  fs="p6"
                  color="text.medium"
                  address={address}
                />
              </Stack>
            </Flex>
          )
        },
      }),
    )
    const statusColumn = columnHelper.accessor("status", {
      header: t("status"),
      cell: ({ row }) => renderStatus(row.original),
    })
    const protocolColumn = columnHelper.accessor("originProtocol", {
      id: "protocol",
      header: t("xcm:history.table.protocol"),
      meta: { gteBp: "lg" },
      cell: ({ row }) => (
        <Flex align="center" gap="s">
          {[
            ...new Set(
              [row.original.originProtocol, row.original.destinationProtocol]
                .filter(Boolean)
                .map((protocol) => protocol.toLowerCase()),
            ),
          ].map((protocol, index) => (
            <Flex key={protocol} align="center" gap="s">
              {index > 0 && (
                <Text fs="p5" color="text.medium">
                  +
                </Text>
              )}
              <JourneyProtocol protocol={protocol} fs="p5" />
            </Flex>
          ))}
        </Flex>
      ),
    })
    const dateColumn = columnHelper.accessor("sentAt", {
      id: "date",
      header: t("date"),
      meta: { gteBp: "md" },
      cell: ({ row }) => (
        <Text fs="p5" color="text.medium">
          {row.original.sentAt
            ? t("date.datetime.short", { value: row.original.sentAt })
            : null}
        </Text>
      ),
    })
    const actionColumn = columnHelper.display({
      id: "action",
      header: "",
      meta: { sx: { textAlign: "right" } },
      cell: ({ row }) => renderActions(row.original),
    })
    const amountColumn = columnHelper.display({
      id: "amount",
      header: t("amount"),
      meta: { sx: { textAlign: "right" } },
      cell: ({ row }) => {
        const asset = getTransferAsset(row.original)
        return (
          <Stack gap="s" align="flex-end" minWidth={0}>
            {asset && (
              <Text fs="p5" fw={500} truncate>
                {t("number", {
                  value: toDecimal(asset.amount, asset.decimals),
                })}
              </Text>
            )}
            {renderStatus(row.original)}
            {row.original.sentAt && (
              <Text fs="p6" color="text.medium">
                {t("date.datetime.short", { value: row.original.sentAt })}
              </Text>
            )}
            {renderActions(row.original)}
          </Stack>
        )
      },
    })
    const columns = [
      assetColumn,
      ...chainColumns,
      statusColumn,
      protocolColumn,
      dateColumn,
      actionColumn,
    ]
    return isMobile
      ? [
          assetColumn,
          ...columns.slice(1).map((column) => ({
            ...column,
            meta: { ...column.meta, visibility: false },
          })),
          amountColumn,
        ]
      : columns
  }, [t, isMobile, pendingCorrelationIds])
}
