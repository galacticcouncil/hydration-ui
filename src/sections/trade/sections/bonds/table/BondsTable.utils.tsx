import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useMemo } from "react"
import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"
import { ButtonTransparent } from "components/Button/Button"
import { ReactComponent as ChevronDownIcon } from "assets/icons/ChevronDown.svg"
import { useTranslation } from "react-i18next"

export type Bond = {
  id: string
  bond: string
  maturity: string
  balance: string
}

export type Config = {
  showTransactions?: boolean
}

export const useActiveBondsTable = (data: Bond[], config: Config) => {
  const { t } = useTranslation()
  const { accessor, display } = createColumnHelper<Bond>()

  const columns = useMemo(
    () => [
      accessor("bond", {
        header: t("bonds.table.bond"),
        cell: ({ getValue }) => (
          <Text color="white">{getValue()?.toString()}</Text>
        ),
      }),
      accessor("maturity", {
        header: () => (
          <div sx={{ textAlign: "right" }}>{t("bonds.table.maturity")}</div>
        ),
        cell: ({ getValue }) => (
          <Text color="white" tAlign="right">
            {getValue()?.toString()}
          </Text>
        ),
      }),
      accessor("balance", {
        header: () => (
          <div sx={{ textAlign: "center" }}>{t("bonds.table.balance")}</div>
        ),
        cell: ({ getValue }) => (
          <Text color="white" tAlign="center">
            {getValue()?.toString()}
          </Text>
        ),
      }),
      display({
        id: "actions",
        cell: ({ row }) => (
          <>
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
          </>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.showTransactions],
  )

  return useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}
