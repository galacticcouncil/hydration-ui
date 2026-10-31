import {
  DataTable,
  Modal,
  Paper,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import type { SortingState } from "@tanstack/react-table"
import { FC, useCallback, useState } from "react"
import { useTranslation } from "react-i18next"

import { SearchEmptyState } from "@/components/EmptyState"
import { TabItem, TabMenu } from "@/components/TabMenu"

import { usePortfolioDepositPreviewColumns } from "./PortfolioDepositPreview.columns"
import { PortfolioDepositSample } from "./PortfolioDepositPreview.mock"
import { SPortfolioDepositTableContainer } from "./PortfolioDepositPreview.styled"
import {
  filterPortfolioDepositSamples,
  PortfolioDepositPreviewFilter,
  prioritizeClaimableDepositSorting,
} from "./PortfolioDepositPreview.utils"
import { PortfolioDepositPreviewClaim } from "./PortfolioDepositPreviewClaim"
import { PortfolioDepositPreviewDetail } from "./PortfolioDepositPreviewDetail"
import {
  usePortfolioDepositPreviewStore,
  usePortfolioDepositSamples,
} from "./usePortfolioDepositPreviewStore"

export type PortfolioDepositPreviewProps = {
  readonly search: string
  readonly filter: PortfolioDepositPreviewFilter
  readonly filterTo: "/portfolio" | "/portfolio/deposits"
}

export const PortfolioDepositPreview: FC<PortfolioDepositPreviewProps> = ({
  search,
  filter,
  filterTo,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const { isMobile } = useBreakpoints()
  const samples = usePortfolioDepositSamples()
  const [sorting, setSorting] = useState<SortingState>(() =>
    prioritizeClaimableDepositSorting([{ id: "date", desc: true }]),
  )
  const claimSample = usePortfolioDepositPreviewStore(
    (state) => state.claimSample,
  )
  const [modal, setModal] = useState<{
    id: string
    view: "details" | "claim"
  } | null>(null)
  const selected = samples.find(({ id }) => id === modal?.id)
  const openDetails = useCallback(
    (deposit: PortfolioDepositSample) =>
      setModal({ id: deposit.id, view: "details" }),
    [],
  )
  const openClaim = useCallback(
    (deposit: PortfolioDepositSample) =>
      setModal({ id: deposit.id, view: "claim" }),
    [],
  )
  const columns = usePortfolioDepositPreviewColumns(openDetails, openClaim)
  const deposits = filterPortfolioDepositSamples(samples, filter)

  return (
    <Stack gap="l">
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
            search: { depositStatus: value },
            resetScroll: false,
          }))}
        />
        <Separator />
        <SPortfolioDepositTableContainer>
          <DataTable
            data={deposits}
            columns={columns}
            size="small"
            fixedLayout={isMobile}
            onRowClick={openDetails}
            sorting={sorting}
            onSortingChange={(updater) =>
              setSorting((previous) =>
                prioritizeClaimableDepositSorting(
                  typeof updater === "function" ? updater(previous) : updater,
                ),
              )
            }
            globalFilter={search}
            globalFilterFn={(row) =>
              [
                row.original.symbol,
                row.original.source,
                row.original.network,
                t(`deposit.portfolio.method.${row.original.method}`),
                t(`deposit.portfolio.status.${row.original.status}`),
              ]
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase())
            }
            emptyState={
              search ? (
                <SearchEmptyState searchPhrase={search} />
              ) : (
                <Text fs="p5" color={getToken("text.medium")} py="xl">
                  {t("deposit.portfolio.noResults")}
                </Text>
              )
            }
          />
        </SPortfolioDepositTableContainer>
      </Paper>
      <Text fs="p6" color={getToken("text.low")}>
        {t("deposit.portfolio.sampleNote")}
      </Text>
      <Modal
        variant="popup"
        open={!!selected}
        onOpenChange={(open) => !open && setModal(null)}
      >
        {selected &&
          (modal?.view === "claim" ? (
            <PortfolioDepositPreviewClaim
              deposit={selected}
              onClose={() => setModal(null)}
              onConfirm={() => {
                claimSample(selected.id)
                setModal(null)
              }}
            />
          ) : (
            <PortfolioDepositPreviewDetail
              deposit={selected}
              onClose={() => setModal(null)}
              onClaim={() => openClaim(selected)}
            />
          ))}
      </Modal>
    </Stack>
  )
}
