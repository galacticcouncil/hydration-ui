import { WhTransfer } from "@galacticcouncil/xcm-sdk"
import { DataTable } from "components/DataTable"
import { useReactTable } from "hooks/useReactTable"
import { useTranslation } from "react-i18next"
import { useWormholeTransfersColumns } from "sections/wallet/assets/wormhole/WalletWormholeRedeemTable.columns"

export type RedeemTableProps = {
  transfers: WhTransfer[]
}

export const RedeemTable: React.FC<RedeemTableProps> = ({ transfers }) => {
  const { t } = useTranslation()
  const columns = useWormholeTransfersColumns()

  const table = useReactTable({
    data: transfers,
    columns,
  })
  return <DataTable table={table} title={t("wormhole.transfers.table.title")} />
}
