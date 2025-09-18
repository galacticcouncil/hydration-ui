import {
  DataTable,
  DataTableRef,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { FC, Ref } from "react"

import { AssetDetailExpanded } from "@/modules/wallet/assets/MyAssets/AssetDetailExpanded"
import { ExpandedNativeRow } from "@/modules/wallet/assets/MyAssets/ExpandedNativeRow"
import { useMyAssetsColumns } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"
import { useMyAssetsTableData } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.data"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly searchPhrase: string
  readonly showAllAssets: boolean
  readonly ref?: Ref<DataTableRef>
}

export const MyAssetsTable: FC<Props> = ({
  searchPhrase,
  showAllAssets,
  ref,
}) => {
  const { isMobile } = useBreakpoints()
  const { native } = useAssets()

  const { data: tableAssets, isLoading: arePricesLoading } =
    useMyAssetsTableData(showAllAssets)
  const columns = useMyAssetsColumns()

  return (
    <TableContainer as={Paper}>
      <DataTable
        ref={ref}
        isLoading={arePricesLoading}
        paginated
        pageSize={10}
        globalFilter={searchPhrase}
        globalFilterFn={(row) =>
          row.original.symbol
            .toLowerCase()
            .includes(searchPhrase.toLowerCase()) ||
          row.original.name.toLowerCase().includes(searchPhrase.toLowerCase())
        }
        data={tableAssets}
        columns={columns}
        expandable={!isMobile}
        renderSubComponent={(asset) =>
          asset.id === native.id ? (
            <ExpandedNativeRow asset={asset} />
          ) : (
            <AssetDetailExpanded asset={asset} />
          )
        }
      />
    </TableContainer>
  )
}
