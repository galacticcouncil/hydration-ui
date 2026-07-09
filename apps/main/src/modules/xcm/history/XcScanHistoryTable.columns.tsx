import { Flex, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { stringEquals } from "@galacticcouncil/utils"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { createColumnHelper } from "@tanstack/react-table"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AccountIdentity } from "@/components/AccountIdentity"
import { JourneyActions } from "@/modules/xcm/history/components/JourneyActions"
import { JourneyAssetLogo } from "@/modules/xcm/history/components/JourneyAssetLogo"
import { JourneyChainLogo } from "@/modules/xcm/history/components/JourneyChainLogo"
import { JourneyDate } from "@/modules/xcm/history/components/JourneyDate"
import { JourneyDisplayStatus } from "@/modules/xcm/history/components/JourneyDisplayStatus"
import { JourneyProtocol } from "@/modules/xcm/history/components/JourneyProtocol"
import { JourneyToAccount } from "@/modules/xcm/history/components/JourneyToAccount"
import { getTransferAsset } from "@/modules/xcm/history/utils/assets"
import { getFormattedAddresses } from "@/modules/xcm/history/utils/journey"
import { toDecimal } from "@/utils/formatting"

const columnHelper = createColumnHelper<XcJourney>()

export enum XcScanHistoryTableColumnId {
  Status = "status",
  From = "from",
  To = "to",
  Assets = "assets",
  Amount = "amount",
  Date = "date",
  Protocol = "protocol",
  Duration = "duration",
  Action = "action",
}

export const useXcScanHistoryColumns = () => {
  const { t } = useTranslation(["common"])

  return useMemo(() => {
    const fromColumn = columnHelper.accessor("from", {
      id: XcScanHistoryTableColumnId.From,
      header: t("from"),
      cell: ({ row }) => {
        const { from } = getFormattedAddresses(row.original)
        return (
          <Flex gap="base" align="center">
            <JourneyChainLogo networkUrn={row.original.origin} />
            <AccountIdentity
              fw={500}
              color={getToken("text.high")}
              address={from}
            />
          </Flex>
        )
      },
    })

    const toColumn = columnHelper.accessor("to", {
      id: XcScanHistoryTableColumnId.To,
      header: t("to"),
      cell: ({ row }) => <JourneyToAccount journey={row.original} />,
    })

    const assetsColumn = columnHelper.accessor("assets", {
      id: XcScanHistoryTableColumnId.Assets,
      header: t("asset"),
      cell: ({ row }) => {
        const transferAsset = getTransferAsset(row.original)

        if (!transferAsset) return null

        const usdValue = Big(row.original.totalUsd || transferAsset?.usd || 0)

        return (
          <Flex gap="base" align="center">
            <JourneyAssetLogo assetKey={transferAsset.asset} />
            <Stack>
              <Text fw={600} color={getToken("text.high")}>
                {transferAsset?.decimals
                  ? t("currency", {
                      value: toDecimal(
                        transferAsset.amount,
                        transferAsset.decimals,
                      ),
                      symbol: transferAsset.symbol,
                    })
                  : t("number", { value: transferAsset.amount })}
              </Text>
              {usdValue.gt(0) && (
                <Text fs="p6" lh={1} color={getToken("text.medium")}>
                  {t("currency", { value: usdValue })}
                </Text>
              )}
            </Stack>
          </Flex>
        )
      },
    })

    const dateColumn = columnHelper.accessor("sentAt", {
      id: XcScanHistoryTableColumnId.Date,
      header: t("date"),
      cell: ({ row }) => {
        const sentAt = row.original.sentAt
        if (!sentAt) {
          return null
        }

        return <JourneyDate timestamp={sentAt} color={getToken("text.high")} />
      },
    })

    const statusColumn = columnHelper.accessor("status", {
      id: XcScanHistoryTableColumnId.Status,
      header: t("status"),
      cell: ({ row }) => <JourneyDisplayStatus journey={row.original} />,
    })

    const protocolColumn = columnHelper.accessor("originProtocol", {
      id: XcScanHistoryTableColumnId.Protocol,
      header: "Protocol",
      cell: ({ row }) => {
        const originProtocol = row.original.originProtocol
        const destinationProtocol = row.original.destinationProtocol

        if (!originProtocol && !destinationProtocol) {
          return null
        }

        if (
          originProtocol &&
          destinationProtocol &&
          stringEquals(originProtocol, destinationProtocol)
        ) {
          return <JourneyProtocol protocol={originProtocol} />
        }

        return (
          <Flex gap="base" align="center">
            {originProtocol && <JourneyProtocol protocol={originProtocol} />}
            {originProtocol && destinationProtocol && (
              <Text fw={500} color={getToken("text.high")}>
                +
              </Text>
            )}
            {destinationProtocol && (
              <JourneyProtocol protocol={destinationProtocol} />
            )}
          </Flex>
        )
      },
    })

    const durationColumn = columnHelper.display({
      id: XcScanHistoryTableColumnId.Duration,
      header: t("duration"),
      cell: ({ row }) => {
        const sentAt = row.original.sentAt
        const recvAt = row.original.recvAt

        if (!sentAt || !recvAt) {
          return null
        }

        const durationMs = recvAt - sentAt

        if (durationMs <= 0) {
          return null
        }

        return (
          <Text fw={500} color={getToken("text.medium")}>
            +{t("interval.short", { value: durationMs })}
          </Text>
        )
      },
    })

    const actionColumn = columnHelper.display({
      id: XcScanHistoryTableColumnId.Action,
      cell: ({ row }) => <JourneyActions journey={row.original} />,
    })

    return [
      assetsColumn,
      fromColumn,
      toColumn,
      dateColumn,
      statusColumn,
      protocolColumn,
      durationColumn,
      actionColumn,
    ]
  }, [t])
}
