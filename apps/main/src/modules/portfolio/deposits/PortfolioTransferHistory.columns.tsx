import { FiatEur, FiatUsd } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  ExternalLink,
  Flex,
  Icon,
  Stack,
  TableRowAction,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { HYDRATION_PARACHAIN_ID } from "@galacticcouncil/utils"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { BankDepositHistoryEntry, isBankDeposit } from "@/api/bankDeposits"
import type { XcScanChains } from "@/api/xcScanMetadata"
import { AccountIdentity } from "@/components/AccountIdentity"
import { ChainLogo } from "@/components/ChainLogo"
import { ClaimButton } from "@/modules/xcm/history/components/ClaimButton"
import { JourneyAssetLogo } from "@/modules/xcm/history/components/JourneyAssetLogo"
import { JourneyChainLogo } from "@/modules/xcm/history/components/JourneyChainLogo"
import { usePendingClaimsStore } from "@/modules/xcm/history/hooks/usePendingClaimsStore"
import {
  getTransferAsset,
  getTransferUsdValue,
} from "@/modules/xcm/history/utils/assets"
import { isJourneyPendingClaim } from "@/modules/xcm/history/utils/claim"
import {
  FAILED_STATUSES,
  getFormattedAddresses,
  getJourneyExplorerLink,
  SUCCESS_STATUSES,
} from "@/modules/xcm/history/utils/journey"
import { getJourneyChainName } from "@/modules/xcm/history/utils/metadata"
import { isOptimisticJourney } from "@/modules/xcm/history/utils/optimistic"
import { toDecimal } from "@/utils/formatting"

import { PortfolioDepositStatus } from "./PortfolioDepositStatus"

export type PortfolioTransferHistoryRow = XcJourney | BankDepositHistoryEntry

export type PortfolioTransferHistoryTableRow = {
  entry: PortfolioTransferHistoryRow
  assets: string
  from: string
  to: string
  status: string
  sentAt: number | undefined
}

const columnHelper = createColumnHelper<PortfolioTransferHistoryTableRow>()

export const usePortfolioTransferHistoryColumns = (
  chains: XcScanChains,
  onBankDetails?: (sample: BankDepositHistoryEntry) => void,
) => {
  const { t } = useTranslation(["common", "xcm", "onramp"])
  const { isMobile } = useBreakpoints()
  const pendingCorrelationIds = usePendingClaimsStore(
    (state) => state.pendingCorrelationIds,
  )

  return useMemo(() => {
    const renderStatus = (journey: PortfolioTransferHistoryRow) =>
      isBankDeposit(journey) ? (
        <PortfolioDepositStatus status={journey.status} />
      ) : (
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
    const renderActions = (journey: PortfolioTransferHistoryRow) =>
      isBankDeposit(journey) ? (
        <TableRowAction
          size="small"
          onClick={() => onBankDetails?.(journey)}
          disabled={!onBankDetails}
        >
          {t("details")}
        </TableRowAction>
      ) : (
        <Flex align="center" justify="flex-end" gap="s">
          {!pendingCorrelationIds.includes(journey.correlationId) &&
            isJourneyPendingClaim(journey) && <ClaimButton journey={journey} />}
          {isOptimisticJourney(journey) ? (
            <TableRowAction size="small" disabled>
              {t("details")}
            </TableRowAction>
          ) : (
            <TableRowAction size="small" asChild>
              <ExternalLink href={getJourneyExplorerLink(journey)}>
                {t("details")}
              </ExternalLink>
            </TableRowAction>
          )}
        </Flex>
      )
    const assetColumn = columnHelper.accessor("assets", {
      id: "assets",
      header: t("asset"),
      cell: ({ row }) => {
        const journey = row.original.entry
        if (isBankDeposit(journey))
          return (
            <Flex gap="base" align="center" minWidth={0}>
              <Icon
                component={journey.currency === "USD" ? FiatUsd : FiatEur}
                size="l"
              />
              {isMobile ? (
                <Stack gap="xs" justify="flex-start" minWidth={0}>
                  <Text fs="p5" fw={500} lh={1} truncate>
                    {journey.symbol}
                  </Text>
                  <Text fs="p6" lh={1} color="text.medium" truncate>
                    {journey.currency} {" → Hydration"}
                  </Text>
                </Stack>
              ) : (
                <Amount
                  value={t("currency", {
                    value: journey.amount,
                    symbol: journey.symbol,
                  })}
                />
              )}
            </Flex>
          )
        const asset = getTransferAsset(journey)
        if (!asset) return null
        const usd = getTransferUsdValue(journey, asset)
        return (
          <Flex gap="base" align="center" minWidth={0}>
            <JourneyAssetLogo assetKey={asset.asset} size="small" />
            {isMobile ? (
              <Stack gap="xs" justify="flex-start" minWidth={0}>
                <Text fs="p5" fw={500} lh={1} truncate>
                  {asset.symbol}
                </Text>
                <Text fs="p6" lh={1} color="text.medium" truncate>
                  {getJourneyChainName(journey.origin, chains)}
                  {" → "}
                  {getJourneyChainName(journey.destination, chains)}
                </Text>
              </Stack>
            ) : (
              <Amount
                value={t("currency", {
                  value: toDecimal(asset.amount, asset.decimals),
                  symbol: asset.symbol,
                })}
                displayValue={
                  usd > 0 ? t("currency", { value: usd }) : undefined
                }
              />
            )}
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
          const journey = row.original.entry
          if (isBankDeposit(journey))
            return (
              <Flex align="center" gap="base">
                {direction === "from" ? (
                  <Icon
                    component={journey.currency === "USD" ? FiatUsd : FiatEur}
                    size="l"
                  />
                ) : (
                  <ChainLogo chainId={HYDRATION_PARACHAIN_ID} />
                )}
                <Stack gap="xs" justify="flex-start">
                  <Text fs="p5" fw={500} lh={1}>
                    {direction === "from" ? journey.currency : "Hydration"}
                  </Text>
                  <Text fs="p6" lh={1} color="text.medium">
                    {direction === "from"
                      ? journey.rail
                      : t("onramp:deposit.portfolio.bankPreview.wallet")}
                  </Text>
                </Stack>
              </Flex>
            )
          const urn =
            direction === "from" ? journey.origin : journey.destination
          const address = getFormattedAddresses(journey)[direction]
          return (
            <Flex align="center" gap="base">
              <JourneyChainLogo networkUrn={urn} />
              <Flex direction="column" gap="xs">
                <Text fs="p5" fw={500} lh={1}>
                  {getJourneyChainName(urn, chains)}
                </Text>
                <AccountIdentity
                  fs="p6"
                  lh={1}
                  color="text.medium"
                  address={address}
                />
              </Flex>
            </Flex>
          )
        },
      }),
    )
    const statusColumn = columnHelper.accessor("status", {
      header: t("status"),
      cell: ({ row }) => renderStatus(row.original.entry),
    })
    const dateColumn = columnHelper.accessor("sentAt", {
      id: "date",
      header: t("date"),
      meta: { gteBp: "md" },
      cell: ({ row }) => (
        <Text fs="p5" color="text.medium">
          {row.original.entry.sentAt
            ? t("date.datetime.short", { value: row.original.entry.sentAt })
            : null}
        </Text>
      ),
    })
    const actionColumn = columnHelper.display({
      id: "action",
      header: "",
      meta: { sx: { textAlign: "right" } },
      cell: ({ row }) => renderActions(row.original.entry),
    })
    const amountColumn = columnHelper.display({
      id: "amount",
      header: t("amount"),
      meta: { sx: { textAlign: "right" } },
      cell: ({ row }) => {
        const bankSample = isBankDeposit(row.original.entry)
          ? row.original.entry
          : null
        const asset = isBankDeposit(row.original.entry)
          ? null
          : getTransferAsset(row.original.entry)
        return (
          <Stack gap="s" align="flex-end" minWidth={0}>
            {bankSample && (
              <Text fs="p5" fw={500} truncate>
                {t("number", { value: bankSample.amount })}
              </Text>
            )}
            {asset && (
              <Text fs="p5" fw={500} truncate>
                {t("number", {
                  value: toDecimal(asset.amount, asset.decimals),
                })}
              </Text>
            )}
            {renderStatus(row.original.entry)}
            {row.original.entry.sentAt && (
              <Text fs="p6" color="text.medium">
                {t("date.datetime.short", { value: row.original.entry.sentAt })}
              </Text>
            )}
            {renderActions(row.original.entry)}
          </Stack>
        )
      },
    })
    const columns = [
      assetColumn,
      ...chainColumns,
      statusColumn,
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
  }, [t, isMobile, pendingCorrelationIds, chains, onBankDetails])
}
