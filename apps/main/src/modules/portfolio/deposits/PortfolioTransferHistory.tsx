import DepositEmptyLounger from "@galacticcouncil/ui/assets/images/DepositEmptyLounger.webp"
import {
  Box,
  Button,
  DataTable,
  DataTableRef,
  Modal,
  Paper,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { FC, useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  BankDepositHistoryEntry,
  bankDepositHistoryQuery,
  isBankDeposit,
} from "@/api/bankDeposits"
import { EmptyState, SearchEmptyState } from "@/components/EmptyState"
import { TabItem, TabMenu } from "@/components/TabMenu"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { useXcScan } from "@/modules/xcm/history/useXcScan"
import { getTransferAsset } from "@/modules/xcm/history/utils/assets"

import { PortfolioBankDepositDetail } from "./PortfolioBankDepositDetail"
import { filterBankDeposits } from "./PortfolioBankDeposits.utils"
import { SPortfolioDepositTableContainer } from "./PortfolioDepositPreview.styled"
import {
  PortfolioTransferHistoryTableRow,
  usePortfolioTransferHistoryColumns,
} from "./PortfolioTransferHistory.columns"
import {
  filterPortfolioTransferHistory,
  PortfolioTransferFilter,
} from "./PortfolioTransferHistory.utils"

export type PortfolioTransferHistoryProps = {
  search: string
  filter: PortfolioTransferFilter
  filterTo: "/portfolio" | "/portfolio/deposits"
}

export const PortfolioTransferHistory: FC<PortfolioTransferHistoryProps> = ({
  search,
  filter,
  filterTo,
}) => {
  const { t } = useTranslation(["onramp", "xcm"])
  const { account } = useAccount()
  const setModal = useOnrampModal((state) => state.setModal)
  const { isMobile } = useBreakpoints()
  const address = account?.address ?? ""
  const { data, isLoading, chainMetadata } = useXcScan(address)
  const [selectedPreview, setSelectedPreview] =
    useState<BankDepositHistoryEntry | null>(null)
  const bankHistory = useQuery(bankDepositHistoryQuery(address))
  const bankDeposits = bankHistory.data?.deposits
  const columns = usePortfolioTransferHistoryColumns(
    chainMetadata,
    setSelectedPreview,
  )
  const tableRef = useRef<DataTableRef>(null)
  const journeys = useMemo<PortfolioTransferHistoryTableRow[]>(
    () =>
      [
        ...filterBankDeposits(bankDeposits ?? [], filter, search),
        ...filterPortfolioTransferHistory(data, filter, search, chainMetadata),
      ].map((entry) => ({
        entry,
        assets: isBankDeposit(entry)
          ? entry.symbol
          : (getTransferAsset(entry)?.symbol ?? ""),
        from: isBankDeposit(entry) ? entry.currency : entry.from,
        to: isBankDeposit(entry) ? "Hydration" : entry.to,
        status: entry.status,
        sentAt: entry.sentAt,
      })),
    [data, filter, search, chainMetadata, bankDeposits],
  )
  const loading =
    !!address && isLoading && !data.length && !bankDeposits?.length
  const hasHistory = data.length > 0 || !!bankDeposits?.length

  useEffect(() => {
    setSelectedPreview(null)
    tableRef.current?.onPaginationReset()
  }, [address, filter, search])

  const emptyState =
    search.trim() && hasHistory ? (
      <SearchEmptyState searchPhrase={search} />
    ) : hasHistory && filter !== "all" ? (
      <Text fs="p5" color="text.medium" py="xl" align="center">
        {t("deposit.portfolio.noResults")}
      </Text>
    ) : (
      <Box py={["l", "xxxl"]}>
        <EmptyState
          image={DepositEmptyLounger}
          header={t("xcm:history.emptyState.noTransfers")}
          description={t(
            address
              ? "xcm:history.emptyState.empty"
              : "xcm:history.emptyState.connectWallet",
          )}
          action={
            <Button
              size="medium"
              variant="secondary"
              onClick={() => setModal("deposit")}
            >
              {t("deposit.portfolio.empty.cta")}
            </Button>
          }
        />
      </Box>
    )

  return (
    <Stack gap="l" data-testid="portfolio-transfer-history">
      <Paper overflow="hidden">
        <TabMenu
          p="m"
          gap="base"
          size="small"
          variant="muted"
          horizontalEdgeOffset="m"
          hideScrollbar
          items={(
            ["all", "pending", "completed", "attention"] as const
          ).map<TabItem>((value) => ({
            to: filterTo,
            title: t(`deposit.portfolio.filter.${value}`),
            search: {
              depositStatus: value,
            },
            resetScroll: false,
          }))}
        />
        <Separator />
        <SPortfolioDepositTableContainer>
          <DataTable
            ref={tableRef}
            paginated
            pageSize={10}
            size="small"
            fixedLayout={isMobile}
            data={journeys}
            columns={columns}
            isLoading={loading}
            initialSorting={[{ id: "date", desc: true }]}
            emptyState={emptyState}
          />
        </SPortfolioDepositTableContainer>
      </Paper>
      <Modal
        variant="popup"
        open={!!selectedPreview}
        onOpenChange={(open) => !open && setSelectedPreview(null)}
      >
        {selectedPreview && (
          <PortfolioBankDepositDetail
            deposit={selectedPreview}
            onClose={() => setSelectedPreview(null)}
          />
        )}
      </Modal>
    </Stack>
  )
}
