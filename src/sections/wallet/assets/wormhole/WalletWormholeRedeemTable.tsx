import { DataTable } from "components/DataTable"

import { useReactTable } from "hooks/useReactTable"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useWormholeTransfersColumns } from "sections/wallet/assets/wormhole/WalletWormholeRedeemTable.columns"
import { useWormholeTransfersQuery } from "api/wormhole"

export const WalletWormholeRedeemTable = () => {
  const { t } = useTranslation()
  const { isLoaded: isApiLoaded } = useRpcProvider()
  const { account } = useAccount()

  const address = account?.address ?? ""

  const { data, isLoading: isTransfersLoading } = useWormholeTransfersQuery(
    address,
    "redeemable",
  )

  const columns = useWormholeTransfersColumns()
  const transfers = useMemo(() => data || [], [data])

  const table = useReactTable({
    data: transfers,
    columns,
  })

  if (!isApiLoaded || isTransfersLoading || transfers.length === 0) {
    return null
  }
  return <DataTable table={table} title={t("wormhole.transfers.table.title")} />
}
