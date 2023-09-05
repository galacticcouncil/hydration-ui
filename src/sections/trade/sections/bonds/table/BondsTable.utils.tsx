import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ReactComponent as TransferIcon } from "assets/icons/TransferIcon.svg"

import { useMemo } from "react"
import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"
import { ButtonTransparent } from "components/Button/Button"
import { ReactComponent as ChevronDownIcon } from "assets/icons/ChevronDown.svg"
import { useTranslation } from "react-i18next"
import { useAssetMeta } from "api/assetMeta"
import { formatDate } from "utils/formatting"
import { AssetTableName } from "components/AssetTableName/AssetTableName"
import { useMedia } from "react-use"
import { TableAction } from "components/Table/Table"
import { Spacer } from "components/Spacer/Spacer"
import { getBondName } from "sections/trade/sections/bonds/Bonds.utils"

export type BondTableItem = {
  assetId: string
  maturity?: number
  balance?: string
  price: string
}

export type Config = {
  showTransactions?: boolean
  enableAnimation?: boolean
  showTransfer?: boolean
}

const BondCell = ({
  assetId,
  maturity,
}: Pick<BondTableItem, "assetId" | "maturity">) => {
  const meta = useAssetMeta(assetId)

  const date = maturity ? new Date(maturity) : new Date()

  return (
    <AssetTableName
      id={assetId}
      name={getBondName(meta.data?.symbol ?? "", date, true)}
      symbol={`${meta.data?.symbol}b`}
    />
  )
}

export const useActiveBondsTable = (data: BondTableItem[], config: Config) => {
  const { t } = useTranslation()
  const { accessor, display } = createColumnHelper<BondTableItem>()

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    assetId: true,
    maturity: isDesktop,
    balance: true,
    price: isDesktop,
    actions: true,
  }

  const columns = useMemo(
    () => [
      accessor("assetId", {
        header: t("bonds.table.bond"),
        cell: ({ getValue, row }) =>
          getValue() ? (
            <BondCell assetId={getValue()} maturity={row.original.maturity} />
          ) : null,
      }),
      accessor("maturity", {
        header: () => (
          <div sx={{ textAlign: "right" }}>{t("bonds.table.maturity")}</div>
        ),
        cell: ({ getValue }) => {
          const value = getValue()

          return value !== undefined ? (
            <Text color="white" tAlign="right">
              {formatDate(new Date(value), "dd/MM/yyyy")}
            </Text>
          ) : null
        },
      }),
      accessor("balance", {
        header: () => (
          <div sx={{ textAlign: "center" }}>{t("bonds.table.balance")}</div>
        ),
        cell: ({ getValue }) => (
          <Text color="white" tAlign="center">
            {getValue()}
          </Text>
        ),
      }),
      accessor("price", {
        header: () => (
          <div sx={{ textAlign: "center" }}>{t("bonds.table.price")}</div>
        ),
        cell: ({ getValue }) => (
          <Text color="white" tAlign="center">
            {getValue()}
          </Text>
        ),
      }),
      display({
        id: "actions",
        cell: ({ row }) => (
          <div sx={{ flex: "row" }}>
            {!!row.original.maturity &&
              row.original.maturity <= new Date().getTime() && (
                <TableAction icon={<TransferIcon />} onClick={console.log}>
                  {t("bonds.table.claim")}
                </TableAction>
              )}
            {config.showTransfer && (
              <TableAction icon={<TransferIcon />} onClick={console.log}>
                {t("bonds.table.transfer")}
              </TableAction>
            )}
            {!config.showTransactions && <Spacer axis="horizontal" size={14} />}
            {config.showTransactions && (
              <ButtonTransparent
                onClick={() => row.toggleSelected()}
                css={{
                  color: theme.colors.iconGray,
                  opacity: row.getIsSelected() ? "1" : "0.5",
                  transform: row.getIsSelected() ? "rotate(180deg)" : undefined,
                }}
              >
                <ChevronDownIcon />
              </ButtonTransparent>
            )}
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.showTransactions, config.showTransfer],
  )

  return useReactTable({
    data,
    columns,
    state: { columnVisibility },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}
