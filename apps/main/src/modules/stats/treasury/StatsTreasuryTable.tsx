import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  DataTable,
  DataTableRef,
  Drawer,
  DrawerBody,
  Flex,
  Input,
  Paper,
  SectionHeader,
  TableContainer,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { Fragment, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  GroupedCompositionAsset,
  TreasuryCompositionAsset,
} from "@/api/treasury"
import { AssetLabelFull } from "@/components/AssetLabelFull"
import { EmptyState } from "@/components/EmptyState"
import { useStatsTreasuryColumns } from "@/modules/stats/treasury/StatsTreasury.columns"
import { ExpandedRowSeparator } from "@/modules/wallet/assets/MyAssets/ExpandedRowSeparator"

type StatsTreasuryTableProps = {
  isLoading: boolean
  primary: TreasuryCompositionAsset[]
  others: TreasuryCompositionAsset[]
}

type DetailRow = {
  label: string
  balance: string
  valueUsd: string
  symbol?: string
  negative?: boolean
  withDebtInfo?: boolean
}

type DetailSection = {
  title?: string
  rows: DetailRow[]
}

const hasPositiveBalance = (value: string | undefined) => Big(value ?? 0).gt(0)

const getAssetDetailSections = (
  item: GroupedCompositionAsset,
): DetailSection[] => {
  const sections: DetailSection[] = []

  sections.push({
    rows: [
      {
        label: "Total balance",
        balance: item.totalBalance,
        valueUsd: item.totalValueDisplay,
        symbol: item.asset.symbol,
      },
    ],
  })

  if (item.netSupply) {
    sections.push({
      title: "Collateral / debt",
      rows: [
        {
          label: "Net Collateral",
          balance: item.netSupply,
          valueUsd: item.netSupplyBalanceDisplay,
          symbol: item.asset.symbol,
        },
        {
          label: "Supplied as collateral",
          balance: item.supply ?? "0",
          valueUsd: item.supplyBalanceDisplay,
          symbol: item.asset.symbol,
        },
        {
          label: "Collateral used by debt",
          balance: item.debt ?? "0",
          valueUsd: item.debtBalanceDisplay,
          symbol: item.asset.symbol,
          negative: true,
          withDebtInfo: true,
        },
      ],
    })
  }

  const breakdownRows: DetailRow[] = []

  if (hasPositiveBalance(item.wallet)) {
    breakdownRows.push({
      label: "Asset balance",
      balance: item.wallet,
      valueUsd: item.assetWalletDisplay,
      symbol: item.asset.symbol,
    })
  }

  if (hasPositiveBalance(item.liquidity)) {
    breakdownRows.push({
      label: "Supplied as Liquidity",
      balance: item.liquidity,
      valueUsd: item.liquidityBalanceDisplay,
      symbol: item.asset.symbol,
    })
  }

  if (hasPositiveBalance(item.offchain)) {
    breakdownRows.push({
      label: "Offchain",
      balance: item.offchain,
      valueUsd: item.offchainBalanceDisplay,
      symbol: item.asset.symbol,
    })
  }

  if (breakdownRows.length) {
    sections.push({
      title: "Breakdown",
      rows: breakdownRows,
    })
  }

  return sections
}

const DebtOffsetTooltipContent = () => (
  <Flex direction="column" gap="xs">
    <Text fs="p6" fw={600} lh={1.2} color="text.high">
      Collateral used by debt
    </Text>
    <Text fs="p7" lh={1.4} color={getToken("text.medium")}>
      Part of supplied collateral backing account borrows.
    </Text>
  </Flex>
)

const TableDetailAmount = ({
  label,
  balance,
  valueUsd,
  symbol,
  negative,
  withDebtInfo,
}: DetailRow) => {
  const { t } = useTranslation("common")

  return (
    <Flex align="center" justify="space-between" gap="base">
      <Flex align="center" gap="xs">
        <Text fs="p4" lh="s" color={getToken("text.low")}>
          {label}
        </Text>
        {withDebtInfo ? (
          <Tooltip
            text={<DebtOffsetTooltipContent />}
            side="top"
            align="start"
            preventDefault
            asChild
          />
        ) : null}
      </Flex>
      <Amount
        value={`${negative ? "-" : ""}${t("currency.compact", {
          value: balance,
          symbol,
        })}`}
        displayValue={`${negative ? "-" : ""}${t("currency.compact", {
          value: valueUsd,
        })}`}
      />
    </Flex>
  )
}

export const StatsTreasuryTable = ({
  isLoading,
  primary,
  others,
}: StatsTreasuryTableProps) => {
  const { t } = useTranslation("common")
  const { isMobile } = useBreakpoints()
  const tableRef = useRef<DataTableRef>(null)

  const [searchPhrase, setSearchPhrase] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [isDetailOpen, setIsDetailOpen] =
    useState<TreasuryCompositionAsset | null>(null)

  const columns = useStatsTreasuryColumns()

  return (
    <>
      <SectionHeader
        title={isFocused && isMobile ? "" : "All treasury assets"}
        sx={{ alignItems: "center" }}
        actions={
          <Input
            value={searchPhrase}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t("search.placeholder.any")}
            iconStart={Search}
            onChange={(e) => {
              setSearchPhrase(e.target.value)
              tableRef.current?.onPaginationReset()
            }}
            customSize="medium"
            sx={{
              width: [isFocused ? "100%" : 100, 270],
            }}
          />
        }
      />

      <TableContainer as={Paper}>
        <DataTable
          ref={tableRef}
          isLoading={isLoading}
          paginated
          globalFilter={searchPhrase}
          globalFilterFn={(row) =>
            row.original.asset.symbol
              .toLowerCase()
              .includes(searchPhrase.toLowerCase()) ||
            row.original.asset.name
              .toLowerCase()
              .includes(searchPhrase.toLowerCase())
          }
          data={[...primary, ...others]}
          columns={columns}
          expandable={!isMobile}
          renderSubComponent={(asset) => <AssetDetail asset={asset} />}
          emptyState={
            <EmptyState
              header={"No treasury assets match your search."}
              description={"No treasury assets found."}
            />
          }
          onRowClick={(asset) => setIsDetailOpen(asset)}
        />
      </TableContainer>
      <Drawer
        open={!!isDetailOpen}
        title={isDetailOpen?.asset.symbol ?? ""}
        onOpenChange={() => setIsDetailOpen(isDetailOpen ? null : isDetailOpen)}
        customTitle={
          isDetailOpen ? <AssetLabelFull asset={isDetailOpen.asset} /> : null
        }
      >
        {isDetailOpen && (
          <>
            <DrawerBody>
              <AssetDetail asset={isDetailOpen} />
            </DrawerBody>
          </>
        )}
      </Drawer>
    </>
  )
}

export const AssetDetail = ({ asset }: { asset: TreasuryCompositionAsset }) => {
  const detailSections = getAssetDetailSections(asset)

  return (
    <Flex direction="column" gap="xl" sx={{ backgroundColor: "inherit" }}>
      {detailSections.map((section, sectionIndex) => (
        <Fragment key={section.title ?? `summary-${sectionIndex}`}>
          {sectionIndex > 0 ? <ExpandedRowSeparator /> : null}
          <Flex direction="column" gap="base">
            {section.title ? (
              <Text
                fs="p7"
                fw={600}
                color={getToken("text.medium")}
                sx={{ textTransform: "uppercase" }}
              >
                {section.title}
              </Text>
            ) : null}
            {section.rows.map((row, index) => (
              <Fragment key={row.label}>
                {index > 0 ? <ExpandedRowSeparator /> : null}
                <TableDetailAmount {...row} />
              </Fragment>
            ))}
          </Flex>
        </Fragment>
      ))}
    </Flex>
  )
}
