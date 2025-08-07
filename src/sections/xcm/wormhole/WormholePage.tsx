import { DataTable } from "components/DataTable"
import { PageHeading } from "components/Layout/PageHeading"
import { Text } from "components/Typography/Text/Text"
import { useReactTable } from "hooks/useReactTable"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useWormholeTransfersColumns } from "sections/xcm/wormhole/WormholePage.columns"
import {
  useWormholeTransfersQuery,
  useWormholeTransfersStatusQuery,
} from "sections/xcm/wormhole/WormholePage.query"
import { useWormholeTransfersApi } from "sections/xcm/wormhole/WormholePage.utils"

export const WormholePage = () => {
  const { t } = useTranslation()
  const { isLoaded: isApiLoaded } = useRpcProvider()
  const { account } = useAccount()
  const api = useWormholeTransfersApi()

  const address = account?.address ?? ""

  const { data, isLoading: isTransfersLoading } = useWormholeTransfersQuery(
    api,
    address,
  )
  const transfers = useMemo(() => data ?? [], [data])
  const statusMap = useWormholeTransfersStatusQuery(api, transfers)
  const columns = useWormholeTransfersColumns(statusMap)

  const table = useReactTable({
    data: transfers,
    columns,
    isLoading: !isApiLoaded || isTransfersLoading,
    skeletonRowCount: 6,
  })

  return (
    <div sx={{ flex: "column", gap: 30 }}>
      <PageHeading>{t("wormhole.transfers.table.title")}</PageHeading>
      <DataTable
        table={table}
        emptyFallback={
          <Text fs={14} color="basic400">
            {t("wormhole.transfers.table.empty")}
          </Text>
        }
      />
    </div>
  )
}
