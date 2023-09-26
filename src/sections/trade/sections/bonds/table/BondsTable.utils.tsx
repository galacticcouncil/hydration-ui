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
import { formatDate } from "utils/formatting"
import { useMedia } from "react-use"
import { TableAction } from "components/Table/Table"
import { useClaimBond } from "sections/trade/sections/bonds/Bonds.utils"
import BN from "bignumber.js"
import { Icon } from "components/Icon/Icon"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { useNavigate } from "@tanstack/react-location"
import { LINKS } from "utils/navigation"
import { useRpcProvider } from "providers/rpcProvider"
import { Transaction } from "./transactions/Transactions.utils"

export type BondTableItem = {
  assetId: string
  maturity?: number
  balance?: BN
  price: string
  balanceHuman?: string
  bondId: string
  isSale: boolean
  assetIn?: string
  averagePrice: BN | undefined
  events: Transaction[]
}

export type Config = {
  showTransactions?: boolean
  enableAnimation?: boolean
  showTransfer?: boolean
  onTransfer: (assetId: string) => void
}

const BondCell = ({ bondId }: { bondId: string }) => {
  const { assets } = useRpcProvider()
  const bond = assets.getBond(bondId)

  if (!bond) return null

  return (
    <div
      sx={{
        flex: "row",
        align: "center",
        gap: 16,
      }}
    >
      <Icon icon={<AssetLogo id={bond.assetId} />} size={30} />
      <div sx={{ flex: "column" }}>
        <Text fs={16} sx={{ mt: 3 }} font="ChakraPetchSemiBold">
          {bond.symbol}
        </Text>
        <Text fs={13} sx={{ mt: 3 }} color={"whiteish500"}>
          {bond.name}
        </Text>
      </div>
    </div>
  )
}

export const useActiveBondsTable = (data: BondTableItem[], config: Config) => {
  const { t } = useTranslation()
  const { accessor, display } = createColumnHelper<BondTableItem>()

  const claim = useClaimBond()
  const navigate = useNavigate()

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
      accessor("bondId", {
        header: t("bonds.table.bond"),
        cell: ({ getValue }) =>
          getValue() ? <BondCell bondId={getValue()} /> : null,
      }),
      accessor("maturity", {
        header: () => (
          <div sx={{ textAlign: ["right", "center"] }}>
            {t("bonds.table.maturity")}
          </div>
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
      accessor("balanceHuman", {
        header: () => (
          <div sx={{ textAlign: "center" }}>{t("bonds.table.balance")}</div>
        ),
        cell: ({ getValue }) => (
          <Text color="white" tAlign="center">
            {t("value.token", { value: getValue() })}
          </Text>
        ),
      }),
      accessor("averagePrice", {
        header: () => (
          <div sx={{ textAlign: "center" }} css={{ whiteSpace: "normal" }}>
            {t("bonds.table.price")}
          </div>
        ),
        cell: ({ getValue }) => (
          <Text color="white" tAlign="center">
            {t("value.token", { value: getValue() })}
          </Text>
        ),
      }),
      display({
        id: "actions",
        cell: ({ row }) => {
          const { maturity, bondId, balance, isSale, assetIn } = row.original
          const isClaimDisabled =
            !bondId ||
            !balance ||
            claim.isLoading ||
            !maturity ||
            maturity >= new Date().getTime()

          return (
            <div sx={{ flex: "row", gap: 10, justify: "end", pr: 16 }}>
              {config.showTransfer && (
                <TableAction
                  onClick={() =>
                    navigate({
                      to: LINKS.bond,
                      search: { assetIn, assetOut: bondId },
                    })
                  }
                  disabled={!isSale}
                >
                  {t("bond.btn")}
                </TableAction>
              )}
              {
                <TableAction
                  variant={config.showTransfer ? "secondary" : "primary"}
                  isLoading={claim.isLoading}
                  disabled={isClaimDisabled}
                  onClick={() =>
                    bondId &&
                    balance &&
                    claim.mutate({ bondId, amount: balance.toString() })
                  }
                >
                  {t("bonds.table.claim")}
                </TableAction>
              }
              {config.showTransfer && bondId && (
                <TableAction
                  icon={<TransferIcon />}
                  onClick={() => config.onTransfer(bondId)}
                >
                  {t("bonds.table.transfer")}
                </TableAction>
              )}
              {config.showTransactions && (
                <ButtonTransparent
                  onClick={() => row.toggleSelected()}
                  css={{
                    color: theme.colors.iconGray,
                    opacity: row.getIsSelected() ? "1" : "0.5",
                    transform: row.getIsSelected()
                      ? "rotate(180deg)"
                      : undefined,
                  }}
                >
                  <ChevronDownIcon />
                </ButtonTransparent>
              )}
            </div>
          )
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.showTransactions, config.showTransfer, claim.isLoading],
  )

  return useReactTable({
    data,
    columns,
    state: { columnVisibility },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}
